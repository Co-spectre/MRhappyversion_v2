import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

const OrderTypeSelector: React.FC = () => {
  const { state } = useOrder();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-red-600" />
        Order Type
      </h3>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 rounded-lg border-2 border-red-600 bg-red-600/10">
          <div className="flex items-center mb-2">
            <MapPin className="w-5 h-5 mr-2 text-red-600" />
            <span className="font-medium text-red-600">Pickup Only</span>
          </div>
          <p className="text-gray-300 text-sm mb-2">Pick up from our restaurant</p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Ready in: 15-20 min</span>
            <span className="text-green-400 font-medium">Free</span>
          </div>
          <div className="mt-3 p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-300 text-sm">
              <strong>Pickup Location:</strong><br />
              {state.pickupLocation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTypeSelector;