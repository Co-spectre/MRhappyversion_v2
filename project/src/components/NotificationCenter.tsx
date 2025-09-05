import { useNotifications } from '../context/NotificationContext';
import { X, CheckCircle, Info, AlertTriangle, XCircle, Bell } from 'lucide-react';

export function NotificationCenter() {
  const { state, removeNotification } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-900/90 border-green-500/50 text-green-100';
      case 'info': return 'bg-blue-900/90 border-blue-500/50 text-blue-100';
      case 'warning': return 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100';
      case 'error': return 'bg-red-900/90 border-red-500/50 text-red-100';
      default: return 'bg-gray-900/90 border-gray-500/50 text-gray-100';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (!state.isVisible || state.notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {state.notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getNotificationColor(notification.type)}
            backdrop-blur-md border rounded-lg p-4 shadow-xl
            transform transition-all duration-300 ease-in-out
            animate-slide-in-right hover:scale-[1.02]
          `}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm opacity-90 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  {notification.orderId && (
                    <p className="text-xs opacity-70 mt-2">
                      Order: {notification.orderId}
                    </p>
                  )}
                  <p className="text-xs opacity-60 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 ml-2 p-1 rounded-md hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar for timed notifications */}
          {!notification.persistent && notification.duration && notification.duration > 0 && (
            <div className="mt-3 w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-white/60 h-1 rounded-full animate-progress"
                style={{ 
                  animationDuration: `${notification.duration}ms`,
                  animationTimingFunction: 'linear'
                }}
              ></div>
            </div>
          )}
        </div>
      ))}
      
      {state.notifications.length > 5 && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            +{state.notifications.length - 5} more notifications
          </p>
        </div>
      )}
    </div>
  );
}
