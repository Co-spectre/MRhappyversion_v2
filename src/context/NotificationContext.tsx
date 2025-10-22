import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { orderGateway } from '../services/OrderGateway';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  createdAt: Date;
  orderId?: string;
}

interface NotificationState {
  notifications: Notification[];
  isVisible: boolean;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_VISIBILITY'; payload: boolean };

const initialState: NotificationState = {
  notifications: [],
  isVisible: true,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
      };
    case 'SET_VISIBILITY':
      return {
        ...state,
        isVisible: action.payload,
      };
    default:
      return state;
  }
}

const NotificationContext = createContext<{
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
} | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      duration: notification.duration || 5000,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-remove non-persistent notifications
    if (!notification.persistent && notification.duration !== 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: newNotification.id });
      }, newNotification.duration);
    }
  };

  // Register with OrderGateway for order notifications
  useEffect(() => {
    // Register for all users since we'll filter by user ID in the gateway
    orderGateway.registerListener('all-users', addNotification);

    return () => {
      orderGateway.unregisterListener('all-users');
    };
  }, []);

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  return (
    <NotificationContext.Provider value={{
      state,
      dispatch,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
