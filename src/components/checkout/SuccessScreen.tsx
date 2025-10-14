import { CheckCircle, Package, Clock, MapPin, Phone, Mail, Printer } from 'lucide-react';

interface SuccessScreenProps {
  orderNumber: string;
  estimatedTime: string;
  orderType: 'delivery' | 'pickup';
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  deliveryAddress?: {
    street: string;
    city: string;
    zipCode: string;
  };
  total: number;
  onClose: () => void;
  onViewOrders: () => void;
}

export function SuccessScreen({
  orderNumber,
  estimatedTime,
  orderType,
  customerInfo,
  deliveryAddress,
  total,
  onClose,
  onViewOrders
}: SuccessScreenProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Animation */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
          <CheckCircle className="w-16 h-16 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-400 text-lg">
          Thank you for your order, {customerInfo.firstName}!
        </p>
      </div>

      {/* Order Number Card */}
      <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-2xl p-6 border-2 border-green-600/50 mb-6">
        <div className="text-center">
          <p className="text-green-400 text-sm font-medium mb-2">Your Order Number</p>
          <p className="text-4xl font-bold text-white tracking-wider mb-2">{orderNumber}</p>
          <p className="text-gray-400 text-sm">
            We've sent a confirmation to <span className="text-white">{customerInfo.email}</span>
          </p>
        </div>
      </div>

      {/* Delivery/Pickup Information */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estimated Time */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">
                {orderType === 'delivery' ? 'Estimated Delivery' : 'Ready for Pickup'}
              </h4>
              <p className="text-green-400 text-lg font-bold">{estimatedTime}</p>
              <p className="text-gray-400 text-sm mt-1">
                {orderType === 'delivery' 
                  ? 'Your food is being prepared and will be on its way soon!'
                  : 'Your food will be ready for pickup at the specified time'}
              </p>
            </div>
          </div>

          {/* Delivery Address / Pickup Location */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              {orderType === 'delivery' ? (
                <MapPin className="w-6 h-6 text-white" />
              ) : (
                <Package className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">
                {orderType === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
              </h4>
              {orderType === 'delivery' && deliveryAddress ? (
                <div className="text-gray-300 text-sm">
                  <p>{deliveryAddress.street}</p>
                  <p>{deliveryAddress.zipCode} {deliveryAddress.city}</p>
                </div>
              ) : (
                <div className="text-gray-300 text-sm">
                  <p className="font-medium">Mr. Happy Burger</p>
                  <p>Vegesacker Straße 123</p>
                  <p>28755 Bremen</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
        <h4 className="text-white font-semibold mb-4">Order Details</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-gray-300">
            <Phone className="w-5 h-5 text-gray-400" />
            <span>{customerInfo.phone}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-300">
            <Mail className="w-5 h-5 text-gray-400" />
            <span>{customerInfo.email}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-700">
            <span className="text-lg font-semibold text-white">Total Paid</span>
            <span className="text-2xl font-bold text-green-400">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Order Tracking Info */}
      <div className="bg-blue-900/30 border border-blue-600/30 rounded-xl p-4 mb-6">
        <p className="text-blue-300 text-sm text-center">
          📱 Track your order in real-time by visiting your order history
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={onViewOrders}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Package className="w-5 h-5" />
          <span>Track Order</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          <Printer className="w-5 h-5" />
          <span>Print Receipt</span>
        </button>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          Continue Shopping
        </button>
      </div>

      {/* Additional Information */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          Need help? Contact us at <span className="text-white">+49 421 123456</span> or{' '}
          <span className="text-white">support@mrhappy.com</span>
        </p>
      </div>
    </div>
  );
}
