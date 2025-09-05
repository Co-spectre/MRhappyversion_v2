import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'on-the-way' | 'delivered' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'paypal';
  deliveryAddress: string;
  orderType: 'delivery' | 'pickup' | 'dine-in';
  placedAt: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  specialInstructions?: string;
  rating?: number;
  review?: string;
  trackingUpdates: TrackingUpdate[];
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
  notes?: string;
}

interface TrackingUpdate {
  id: string;
  status: Order['status'];
  timestamp: Date;
  message: string;
  estimatedTime?: number; // minutes
}

interface OrderTrackingContextType {
  orders: Order[];
  currentOrder: Order | null;
  placeOrder: (orderData: Omit<Order, 'id' | 'placedAt' | 'trackingUpdates'>) => Promise<string>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  rateOrder: (orderId: string, rating: number, review?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
  reorder: (orderId: string) => void;
  trackOrder: (orderId: string) => void;
  stopTracking: () => void;
}

const OrderTrackingContext = createContext<OrderTrackingContextType | undefined>(undefined);

export const OrderTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [trackingInterval, setTrackingInterval] = useState<number | null>(null);
  const { state: authState } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  // Load orders from localStorage
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const savedOrders = localStorage.getItem(`orders_${authState.user.email}`);
      if (savedOrders) {
        try {
          const parsedOrders = JSON.parse(savedOrders);
          // Convert date strings back to Date objects
          const ordersWithDates = parsedOrders.map((order: any) => ({
            ...order,
            placedAt: new Date(order.placedAt),
            estimatedDelivery: new Date(order.estimatedDelivery),
            actualDelivery: order.actualDelivery ? new Date(order.actualDelivery) : undefined,
            trackingUpdates: order.trackingUpdates.map((update: any) => ({
              ...update,
              timestamp: new Date(update.timestamp)
            }))
          }));
          setOrders(ordersWithDates);
        } catch (error) {
          console.error('Error loading orders:', error);
        }
      }
    } else {
      setOrders([]);
    }
  }, [authState.isAuthenticated, authState.user]);

  // Save orders to localStorage
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      localStorage.setItem(`orders_${authState.user.email}`, JSON.stringify(orders));
    }
  }, [orders, authState.isAuthenticated, authState.user]);

  const generateOrderId = () => {
    return `MR${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  };

  const placeOrder = async (orderData: Omit<Order, 'id' | 'placedAt' | 'trackingUpdates'>): Promise<string> => {
    if (!authState.isAuthenticated || !authState.user) {
      throw new Error('User must be authenticated to place an order');
    }

    const orderId = generateOrderId();
    const now = new Date();
    const estimatedDeliveryTime = orderData.orderType === 'delivery' ? 45 : 
                                  orderData.orderType === 'pickup' ? 20 : 30;
    
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      userId: authState.user.email,
      placedAt: now,
      estimatedDelivery: new Date(now.getTime() + estimatedDeliveryTime * 60000),
      trackingUpdates: [
        {
          id: `update_${Date.now()}`,
          status: 'placed',
          timestamp: now,
          message: t('orderPlacedMessage'),
          estimatedTime: estimatedDeliveryTime
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    
    // Simulate order progression
    simulateOrderProgress(orderId);
    
    showToast(t('orderPlacedSuccessfully'), 'success');
    return orderId;
  };

  const simulateOrderProgress = (orderId: string) => {
    const progressSteps = [
      { status: 'confirmed' as const, delay: 2000, message: t('orderConfirmedMessage'), estimatedTime: 35 },
      { status: 'preparing' as const, delay: 8000, message: t('orderPreparingMessage'), estimatedTime: 25 },
      { status: 'ready' as const, delay: 20000, message: t('orderReadyMessage'), estimatedTime: 10 },
      { status: 'on-the-way' as const, delay: 25000, message: t('orderOnTheWayMessage'), estimatedTime: 5 },
      { status: 'delivered' as const, delay: 35000, message: t('orderDeliveredMessage'), estimatedTime: 0 }
    ];

    progressSteps.forEach(({ status, delay, message, estimatedTime }) => {
      setTimeout(() => {
        updateOrderStatus(orderId, status, message, estimatedTime);
      }, delay);
    });
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], message: string, estimatedTime?: number) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newUpdate: TrackingUpdate = {
          id: `update_${Date.now()}`,
          status,
          timestamp: new Date(),
          message,
          estimatedTime
        };
        
        const updatedOrder = {
          ...order,
          status,
          trackingUpdates: [...order.trackingUpdates, newUpdate],
          ...(status === 'delivered' && { actualDelivery: new Date() })
        };

        // Update current order if it's being tracked
        if (currentOrder?.id === orderId) {
          setCurrentOrder(updatedOrder);
        }

        return updatedOrder;
      }
      return order;
    }));

    // Show toast notification for status updates
    if (currentOrder?.id === orderId) {
      showToast(message, 'success');
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    // Can only cancel orders that haven't been prepared yet
    if (['preparing', 'ready', 'on-the-way', 'delivered'].includes(order.status)) {
      showToast(t('cannotCancelOrder'), 'error');
      return false;
    }

    updateOrderStatus(orderId, 'cancelled', t('orderCancelledMessage'));
    showToast(t('orderCancelledSuccessfully'), 'success');
    return true;
  };

  const rateOrder = (orderId: string, rating: number, review?: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, rating, review }
        : order
    ));
    showToast(t('thankYouForRating'), 'success');
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  const reorder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !authState.user) return;

    // Create a new order with the same items but updated timestamp
    const reorderData = {
      userId: authState.user.email,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      items: order.items,
      total: order.total,
      status: 'placed' as const,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      orderType: order.orderType,
      estimatedDelivery: new Date(),
      specialInstructions: order.specialInstructions
    };

    placeOrder(reorderData);
  };

  const trackOrder = (orderId: string) => {
    const order = getOrderById(orderId);
    if (order) {
      setCurrentOrder(order);
      
      // Start real-time tracking simulation
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }

      const interval = setInterval(() => {
        const currentOrder = getOrderById(orderId);
        if (currentOrder?.status === 'delivered' || currentOrder?.status === 'cancelled') {
          clearInterval(interval);
          setTrackingInterval(null);
        }
      }, 5000);

      setTrackingInterval(interval);
    }
  };

  const stopTracking = () => {
    setCurrentOrder(null);
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  return (
    <OrderTrackingContext.Provider value={{
      orders,
      currentOrder,
      placeOrder,
      cancelOrder,
      rateOrder,
      getOrderById,
      getOrdersByStatus,
      reorder,
      trackOrder,
      stopTracking
    }}>
      {children}
    </OrderTrackingContext.Provider>
  );
};

export const useOrderTracking = () => {
  const context = useContext(OrderTrackingContext);
  if (context === undefined) {
    throw new Error('useOrderTracking must be used within an OrderTrackingProvider');
  }
  return context;
};
