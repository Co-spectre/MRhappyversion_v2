import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Order, CartItem } from '../types';
import { orderGateway } from '../services/OrderGateway';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  orderType: 'pickup'; // Only pickup allowed now
  selectedAddress: string | null;
  pickupLocation: string;
  scheduledTime: Date | null;
  specialInstructions: string;
}

type OrderAction = 
  | { type: 'SET_ORDER_TYPE'; payload: 'pickup' } // Only pickup allowed
  | { type: 'SET_ADDRESS'; payload: string }
  | { type: 'SET_PICKUP_LOCATION'; payload: string }
  | { type: 'SET_SCHEDULED_TIME'; payload: Date | null }
  | { type: 'SET_SPECIAL_INSTRUCTIONS'; payload: string }
  | { type: 'CREATE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  | { type: 'LOAD_ORDERS'; payload: Order[] };

const OrderContext = createContext<{
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
  createOrder: (items: CartItem[], userId: string) => Promise<Order>;
  getOrderHistory: (userId: string) => Order[];
  trackOrder: (orderId: string) => Order | null;
} | undefined>(undefined);

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.payload };
    
    case 'SET_ADDRESS':
      return { ...state, selectedAddress: action.payload };
    
    case 'SET_PICKUP_LOCATION':
      return { ...state, pickupLocation: action.payload };
    
    case 'SET_SCHEDULED_TIME':
      return { ...state, scheduledTime: action.payload };
    
    case 'SET_SPECIAL_INSTRUCTIONS':
      return { ...state, specialInstructions: action.payload };
    
    case 'CREATE_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        currentOrder: action.payload
      };
    
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status, updatedAt: new Date() }
            : order
        )
      };
    
    case 'LOAD_ORDERS':
      return { ...state, orders: action.payload };
    
    default:
      return state;
  }
};

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, {
    orders: [],
    currentOrder: null,
    orderType: 'pickup' as const, // Only pickup allowed
    selectedAddress: null,
    pickupLocation: 'Mr.Happy Restaurant - Hauptstraße 123, Bremen',
    scheduledTime: null,
    specialInstructions: ''
  });

  const createOrder = async (items: CartItem[], userId: string): Promise<Order> => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = 0; // No tax as requested
    const deliveryFee = 0; // No delivery fee for pickup
    const tip = 0; // Will be set during checkout
    
    const order: Order = {
      id: `ORD-${Date.now()}`,
      userId,
      items,
      subtotal,
      tax,
      deliveryFee,
      tip,
      total: subtotal + tax + deliveryFee,
      status: 'pending',
      orderType: 'pickup',
      scheduledTime: state.scheduledTime || undefined,
      pickupLocation: state.pickupLocation,
      specialInstructions: state.specialInstructions,
      createdAt: new Date(),
      updatedAt: new Date(),
      customerInfo: {
        name: 'Customer', // This will be filled from actual user data
        phone: '+49 123 456789',
        email: 'customer@email.com'
      }
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add order through the gateway for real-time notifications
    orderGateway.addOrder(order);
    
    dispatch({ type: 'CREATE_ORDER', payload: order });

    return order;
  };

  const getOrderHistory = (userId: string): Order[] => {
    return orderGateway.getUserOrders(userId);
  };

  const trackOrder = (orderId: string): Order | null => {
    return orderGateway.getOrder(orderId) || null;
  };

  return (
    <OrderContext.Provider value={{
      state,
      dispatch,
      createOrder,
      getOrderHistory,
      trackOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};