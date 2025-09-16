import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { orderGateway } from '../services/OrderGateway';
import { Order } from '../types';
import { 
  Clock, 
  CheckCircle, 
  Package, 
  MapPin, 
  Phone, 
  Mail,
  RefreshCw,
  AlertCircle,
  ChefHat
} from 'lucide-react';

const MyOrdersPage: React.FC = () => {
  const { state: authState } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (authState.user) {
      loadUserOrders();
      
      // Set up real-time updates by polling every 3 seconds
      const interval = setInterval(loadUserOrders, 3000);
      
      return () => clearInterval(interval);
    }
  }, [authState.user]);

  const loadUserOrders = () => {
    if (authState.user) {
      const userOrders = orderGateway.getUserOrders(authState.user.id);
      setOrders(userOrders);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-600';
      case 'confirmed':
        return 'bg-blue-900/20 text-blue-400 border-blue-600';
      case 'preparing':
        return 'bg-orange-900/20 text-orange-400 border-orange-600';
      case 'ready':
        return 'bg-green-900/20 text-green-400 border-green-600';
      case 'completed':
        return 'bg-green-900/20 text-green-300 border-green-500';
      case 'cancelled':
        return 'bg-red-900/20 text-red-400 border-red-600';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-600';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'preparing':
        return <ChefHat className="w-4 h-4" />;
      case 'ready':
        return <Package className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusMessage = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return t('order.status.message.pending');
      case 'confirmed':
        return t('order.status.message.confirmed');
      case 'preparing':
        return t('order.status.message.preparing');
      case 'ready':
        return t('order.status.message.ready');
      case 'completed':
        return t('order.status.message.completed');
      case 'cancelled':
        return t('order.status.message.cancelled');
      default:
        return t('order.status.message.unknown');
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t('myOrders.loginRequired')}</h2>
          <p className="text-gray-400">{t('myOrders.loginMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{t('myOrders.title')}</h1>
              <p className="text-gray-400">{t('myOrders.subtitle')}</p>
            </div>
            <button
              onClick={loadUserOrders}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('myOrders.refresh')}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
            <p className="text-gray-400">Start ordering from our delicious menu!</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-gray-800 border border-gray-700 rounded-lg p-6 cursor-pointer transition-all hover:border-red-500 ${
                    selectedOrder?.id === order.id ? 'border-red-500 ring-1 ring-red-500' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Order #{order.id.slice(-6)}</h3>
                      <p className="text-gray-400 text-sm">
                        {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm mb-2">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-400">{item.quantity}x {item.menuItem.name}</span>
                          <span className="text-gray-300">${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-gray-500 text-xs">+{order.items.length - 2} more items</p>
                      )}
                    </div>
                  </div>

                  {/* Total and Status Message */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Total</span>
                      <span className="text-xl font-bold text-white">${order.total.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{getStatusMessage(order.status)}</p>
                  </div>

                  {/* Estimated Time */}
                  {order.estimatedTime && order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className="mt-3 flex items-center space-x-2 text-orange-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Est. {order.estimatedTime}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Order Details */}
            {selectedOrder && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-fit sticky top-24">
                <h2 className="text-xl font-bold text-white mb-4">Order Details</h2>
                
                {/* Status Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{getStatusMessage(selectedOrder.status)}</p>
                </div>

                {/* Customer Info */}
                <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="text-white font-medium mb-3">Pickup Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{selectedOrder.customerInfo.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{selectedOrder.customerInfo.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{selectedOrder.pickupLocation || 'Mr.Happy Restaurant'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-white font-medium mb-3">Items Ordered</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white">{item.menuItem.name}</h4>
                          <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                          {item.specialInstructions && (
                            <p className="text-gray-500 text-xs mt-1">"{item.specialInstructions}"</p>
                          )}
                        </div>
                        <span className="text-white font-medium">${item.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tax</span>
                      <span className="text-white">${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tip</span>
                      <span className="text-white">${selectedOrder.tip.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-600">
                      <span className="text-white font-medium">Total</span>
                      <span className="text-white font-bold text-lg">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="mt-6">
                  <h3 className="text-white font-medium mb-3">Order Timeline</h3>
                  <div className="text-sm text-gray-400">
                    <p>Ordered: {formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}</p>
                    <p>Last Updated: {formatDate(selectedOrder.updatedAt)} at {formatTime(selectedOrder.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
