import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 means persistent
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationProps {
  notification: NotificationData;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto-dismiss after duration
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Match exit animation duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-900/90 border-green-600/50 text-green-100';
      case 'error':
        return 'bg-red-900/90 border-red-600/50 text-red-100';
      case 'warning':
        return 'bg-orange-900/90 border-orange-600/50 text-orange-100';
      case 'info':
      default:
        return 'bg-blue-900/90 border-blue-600/50 text-blue-100';
    }
  };

  return (
    <div
      className={`relative flex items-start space-x-3 max-w-sm w-full p-4 rounded-lg border backdrop-blur-sm shadow-lg transition-all duration-300 ease-out ${
        getColorClasses()
      } ${
        isVisible && !isLeaving
          ? 'transform translate-x-0 opacity-100 scale-100'
          : 'transform translate-x-full opacity-0 scale-95'
      }`}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold">{notification.title}</h4>
        <p className="text-sm opacity-90 mt-1">{notification.message}</p>
        
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className={`mt-2 text-xs font-medium underline hover:no-underline transition-all ${
              notification.type === 'success' ? 'text-green-300 hover:text-green-200' :
              notification.type === 'error' ? 'text-red-300 hover:text-red-200' :
              notification.type === 'warning' ? 'text-orange-300 hover:text-orange-200' :
              'text-blue-300 hover:text-blue-200'
            }`}
          >
            {notification.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface NotificationSystemProps {
  notifications: NotificationData[];
  onClose: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Notification notification={notification} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: NotificationData = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (title: string, message: string, options?: Partial<NotificationData>) => {
    return addNotification({ type: 'success', title, message, ...options });
  };

  const showError = (title: string, message: string, options?: Partial<NotificationData>) => {
    return addNotification({ type: 'error', title, message, ...options });
  };

  const showWarning = (title: string, message: string, options?: Partial<NotificationData>) => {
    return addNotification({ type: 'warning', title, message, ...options });
  };

  const showInfo = (title: string, message: string, options?: Partial<NotificationData>) => {
    return addNotification({ type: 'info', title, message, ...options });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default NotificationSystem;
