import React from 'react';
import { ShoppingBag, Truck, Receipt, Gift } from 'lucide-react';

interface OrderSummaryProps {
  subtotal: number;
  deliveryFee: number;
  tip: number;
  tax: number;
  total: number;
  itemCount: number;
  orderType: 'delivery' | 'pickup';
}

export function OrderSummary({
  subtotal,
  deliveryFee,
  tip,
  tax,
  total,
  itemCount,
  orderType
}: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 border border-gray-700 shadow-xl sticky top-4">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
        <ShoppingBag className="w-5 h-5 text-red-500" />
        <span>Order Summary</span>
      </h3>

      <div className="space-y-3 mb-4 pb-4 border-b border-gray-700">
        {/* Items Count */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Items ({itemCount})</span>
          <span className="text-white font-medium">{formatPrice(subtotal)}</span>
        </div>

        {/* Delivery Fee */}
        {orderType === 'delivery' && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 flex items-center space-x-1">
              <Truck className="w-4 h-4" />
              <span>Delivery Fee</span>
            </span>
            <span className="text-white font-medium">
              {deliveryFee === 0 ? (
                <span className="text-green-400">FREE</span>
              ) : (
                formatPrice(deliveryFee)
              )}
            </span>
          </div>
        )}

        {/* Tip */}
        {orderType === 'delivery' && tip > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 flex items-center space-x-1">
              <Gift className="w-4 h-4" />
              <span>Tip for Driver</span>
            </span>
            <span className="text-white font-medium">{formatPrice(tip)}</span>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400 flex items-center space-x-1">
            <Receipt className="w-4 h-4" />
            <span>Tax (19% VAT)</span>
          </span>
          <span className="text-white font-medium">{formatPrice(tax)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-2">
        <span className="text-lg font-bold text-white">Total</span>
        <span className="text-2xl font-bold text-red-500">{formatPrice(total)}</span>
      </div>

      {/* Savings Badge */}
      {deliveryFee === 0 && orderType === 'delivery' && (
        <div className="mt-4 bg-green-900/30 border border-green-600/30 rounded-lg p-3">
          <p className="text-green-400 text-xs font-medium text-center">
            🎉 You saved delivery fee!
          </p>
        </div>
      )}

      {/* Pickup Info */}
      {orderType === 'pickup' && (
        <div className="mt-4 bg-blue-900/30 border border-blue-600/30 rounded-lg p-3">
          <p className="text-blue-400 text-xs font-medium text-center">
            ✓ No delivery fee for pickup orders
          </p>
        </div>
      )}
    </div>
  );
}
