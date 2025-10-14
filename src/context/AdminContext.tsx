import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Order, InventoryItem, AuthUser, OrderAnalytics } from '../types';
import { orderGateway } from '../services/OrderGateway';
import { notificationSound } from '../utils/notificationSound';

interface AdminState {
  orders: Order[];
  users: AuthUser[];
  inventory: InventoryItem[];
  analytics: OrderAnalytics | null;
  isLoading: boolean;
  selectedOrder: Order | null;
  filters: {
    orderStatus: string;
    dateRange: {
      start: Date | null;
      end: Date | null;
    };
    searchTerm: string;
  };
}

type AdminAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: { id: string; updates: Partial<Order> } }
  | { type: 'CLEAR_ALL_ORDERS' }
  | { type: 'SET_USERS'; payload: AuthUser[] }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: { id: string; updates: Partial<InventoryItem> } }
  | { type: 'SET_ANALYTICS'; payload: OrderAnalytics }
  | { type: 'SELECT_ORDER'; payload: Order | null }
  | { type: 'SET_FILTERS'; payload: Partial<AdminState['filters']> };

const initialState: AdminState = {
  orders: [],
  users: [],
  inventory: [],
  analytics: null,
  isLoading: false,
  selectedOrder: null,
  filters: {
    orderStatus: 'all',
    dateRange: {
      start: null,
      end: null,
    },
    searchTerm: '',
  },
};

const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Beef Patties',
    category: 'Protein',
    currentStock: 50,
    minStockLevel: 20,
    maxStockLevel: 100,
    unit: 'pieces',
    costPerUnit: 2.50,
    supplier: 'Premium Meat Co.',
    lastRestocked: new Date('2025-07-30'),
    status: 'in-stock',
  },
  {
    id: 'inv-2',
    name: 'Brioche Buns',
    category: 'Bakery',
    currentStock: 15,
    minStockLevel: 30,
    maxStockLevel: 80,
    unit: 'pieces',
    costPerUnit: 0.75,
    supplier: 'Local Bakery',
    lastRestocked: new Date('2025-07-29'),
    status: 'low-stock',
  },
  {
    id: 'inv-3',
    name: 'Cheese Slices',
    category: 'Dairy',
    currentStock: 0,
    minStockLevel: 25,
    maxStockLevel: 60,
    unit: 'pieces',
    costPerUnit: 0.30,
    supplier: 'Dairy Fresh',
    lastRestocked: new Date('2025-07-28'),
    status: 'out-of-stock',
  },
];

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'CLEAR_ALL_ORDERS':
      return { ...state, orders: [], selectedOrder: null };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id
            ? { ...order, ...action.payload.updates, updatedAt: new Date() }
            : order
        ),
        selectedOrder: state.selectedOrder?.id === action.payload.id
          ? { ...state.selectedOrder, ...action.payload.updates, updatedAt: new Date() }
          : state.selectedOrder,
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };
    case 'SELECT_ORDER':
      return { ...state, selectedOrder: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}

const AdminContext = createContext<{
  state: AdminState;
  dispatch: React.Dispatch<AdminAction>;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateInventoryStock: (itemId: string, newStock: number) => void;
  getFilteredOrders: () => Order[];
} | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, initialState);
  const previousOrderCountRef = useRef<number>(0);

  useEffect(() => {
    // Load orders from the gateway instead of mock data
    const orders = orderGateway.getAllOrders();
    dispatch({ type: 'SET_ORDERS', payload: orders });
    dispatch({ type: 'SET_INVENTORY', payload: mockInventory });

    // Initialize the previous order count
    previousOrderCountRef.current = orders.length;

    // Set up real-time order updates
    const interval = setInterval(() => {
      const updatedOrders = orderGateway.getAllOrders();
      
      // Check if there are new orders
      const currentOrderCount = updatedOrders.length;
      const previousOrderCount = previousOrderCountRef.current;
      
      if (currentOrderCount > previousOrderCount) {
        // New order(s) detected! Play notification sound
        const newOrdersCount = currentOrderCount - previousOrderCount;
        console.log(`🔔 ${newOrdersCount} new order(s) received!`);
        
        // Play notification sound
        notificationSound.playNotification();
        
        // Update the count
        previousOrderCountRef.current = currentOrderCount;
      }
      
      dispatch({ type: 'SET_ORDERS', payload: updatedOrders });
    }, 1000); // Check for updates every second

    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    // Update through the gateway to trigger notifications
    orderGateway.updateOrderStatus(orderId, status, true);
    
    // Update local state
    dispatch({
      type: 'UPDATE_ORDER',
      payload: { id: orderId, updates: { status } },
    });
  };

  const addOrder = (order: Order) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
  };

  const updateInventoryStock = (itemId: string, newStock: number) => {
    const item = state.inventory.find(item => item.id === itemId);
    if (item) {
      let status: InventoryItem['status'] = 'in-stock';
      if (newStock === 0) status = 'out-of-stock';
      else if (newStock <= item.minStockLevel) status = 'low-stock';

      dispatch({
        type: 'UPDATE_INVENTORY_ITEM',
        payload: { id: itemId, updates: { currentStock: newStock, status } },
      });
    }
  };

  const getFilteredOrders = (): Order[] => {
    let filtered = state.orders;

    if (state.filters.orderStatus !== 'all') {
      filtered = filtered.filter(order => order.status === state.filters.orderStatus);
    }

    if (state.filters.searchTerm) {
      const searchLower = state.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchLower) ||
        order.customerInfo.name.toLowerCase().includes(searchLower) ||
        order.customerInfo.phone.includes(searchLower)
      );
    }

    if (state.filters.dateRange.start) {
      filtered = filtered.filter(order => {
        const orderDate = typeof order.createdAt === 'string' ? new Date(order.createdAt) : order.createdAt;
        return orderDate >= state.filters.dateRange.start!;
      });
    }

    if (state.filters.dateRange.end) {
      filtered = filtered.filter(order => {
        const orderDate = typeof order.createdAt === 'string' ? new Date(order.createdAt) : order.createdAt;
        return orderDate <= state.filters.dateRange.end!;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt;
      const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });
  };

  return (
    <AdminContext.Provider value={{
      state,
      dispatch,
      addOrder,
      updateOrderStatus,
      updateInventoryStock,
      getFilteredOrders,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
