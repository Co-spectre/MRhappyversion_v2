import React, { useState } from 'react';
import { Percent, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';

const SpecialOffersSection: React.FC = () => {
  const { state, applyPromoCode, dispatch } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [message, setMessage] = useState('');

  const handleApplyCode = () => {
    if (promoCode.trim()) {
      applyPromoCode(promoCode.trim());
      if (promoCode.toLowerCase() === 'mr.happy') {
        setMessage('Promo code applied! 10% discount added to your order.');
        // Open cart to show the discount
        dispatch({ type: 'OPEN_CART' });
      } else {

      }
      setPromoCode('');
    }
  };
  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Special <span className="text-red-500">Offers</span> & Deals
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Enter your promo code to save on your order
          </p>
        </div>

        {/* Promo Code Section */}
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-8 text-center border border-gray-600">
            <div className="flex items-center justify-center mb-4">
              <Percent className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-2xl font-bold text-white">Promo Code</h3>
            </div>
            <p className="text-gray-300 mb-6">
              Use code <span className="text-red-500 font-bold">MR.Happy</span> for 10% off your entire order!
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                onKeyPress={(e) => e.key === 'Enter' && handleApplyCode()}
              />
              <button
                onClick={handleApplyCode}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Apply Code
              </button>
              {message && (
                <p className={`text-sm ${message.includes('applied') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
              {state.promoCode && (
                <p className="text-green-400 text-sm">
                  Current code: <span className="font-bold">{state.promoCode}</span> - {state.discount > 0 ? `€${state.discount.toFixed(2)} discount applied` : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersSection;
