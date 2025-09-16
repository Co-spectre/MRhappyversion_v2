import React, { useEffect, useState } from 'react';
import { Clock, MapPin, Truck, Star, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

const OrderHistory: React.FC = () => {
  const { state: authState } = useAuth();
  const { getOrderHistory } = useOrder();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (authState.user) {
      const userOrders = getOrderHistory(authState.user.id);
      setOrders(userOrders);
    }
  }, [authState.user, getOrderHistory]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'confirmed': return 'text-blue-400';
      case 'preparing': return 'text-orange-400';
      case 'ready': return 'text-green-400';
      case 'out-for-delivery': return 'text-purple-400';
      case 'delivered': return 'text-green-500';
      case 'completed': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'out-for-delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.menuItem, item.customizations, item.quantity);
    });
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">Please sign in to view your order history</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-2">No orders yet</p>
        <p className="text-gray-500">Your order history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
      
      {orders.map((order) => (
        <div key={order.id} className="bg-black border border-gray-800 rounded-xl p-6">
          {/* Order Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Order #{order.id.slice(-8).toUpperCase()}
              </h3>
              <p className="text-gray-400 text-sm">
                {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <div className={`font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </div>
              <div className="text-white font-bold text-lg">
                €{order.total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="flex items-center mb-4 text-gray-400">
            {order.orderType === 'delivery' ? (
              <Truck className="w-4 h-4 mr-2" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            <span className="capitalize">{order.orderType}</span>
            {order.estimatedTime && (
              <span className="ml-4">• Est. {order.estimatedTime}</span>
            )}
          </div>

          {/* Order Items */}
          <div className="space-y-3 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="text-white font-medium">{item.menuItem.name}</h4>
                    <p className="text-gray-400 text-sm">Qty: {item.quantity}</p>
                    {item.customizations && item.customizations.length > 0 && (
                      <p className="text-gray-500 text-xs">
                        {item.customizations.length} modification(s)
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-white font-medium">
                  €{item.totalPrice.toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Order Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div className="flex space-x-3">
              <button
                onClick={() => handleReorder(order)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reorder</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                <Star className="w-4 h-4" />
                <span>Rate Order</span>
              </button>
            </div>
            
            {order.specialInstructions && (
              <div className="text-right">
                <p className="text-gray-500 text-xs">Special Instructions:</p>
                <p className="text-gray-400 text-sm">{order.specialInstructions}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;