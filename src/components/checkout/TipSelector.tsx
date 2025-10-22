import { useState } from 'react';
import { Gift, Euro } from 'lucide-react';

interface TipSelectorProps {
  subtotal: number;
  selectedTip: number;
  onTipChange: (tip: number) => void;
}

export function TipSelector({ subtotal, selectedTip, onTipChange }: TipSelectorProps) {
  const [customTip, setCustomTip] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const tipOptions = [
    { label: 'No Tip', value: 0, percentage: 0 },
    { label: '10%', value: subtotal * 0.10, percentage: 10 },
    { label: '15%', value: subtotal * 0.15, percentage: 15 },
    { label: '20%', value: subtotal * 0.20, percentage: 20 },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleTipSelect = (value: number) => {
    setShowCustomInput(false);
    setCustomTip('');
    onTipChange(value);
  };

  const handleCustomTip = () => {
    const value = parseFloat(customTip);
    if (!isNaN(value) && value >= 0) {
      onTipChange(value);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Gift className="w-5 h-5 text-yellow-500" />
        <h4 className="text-lg font-bold text-white">Tip for Delivery Driver</h4>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">
        Show your appreciation for great service! 100% goes to the driver.
      </p>

      {/* Quick Tip Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {tipOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => handleTipSelect(option.value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedTip === option.value && !showCustomInput
                ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-yellow-500/50 hover:bg-yellow-500/10'
            }`}
          >
            <div className="font-bold text-lg">{option.label}</div>
            {option.value > 0 && (
              <div className="text-sm mt-1">{formatPrice(option.value)}</div>
            )}
          </button>
        ))}
      </div>

      {/* Custom Tip Input */}
      <div className="space-y-3">
        <button
          onClick={() => {
            setShowCustomInput(!showCustomInput);
            if (!showCustomInput) {
              setCustomTip('');
            }
          }}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 font-medium ${
            showCustomInput
              ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
              : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-yellow-500/50 hover:bg-yellow-500/10'
          }`}
        >
          💰 Custom Amount
        </button>

        {showCustomInput && (
          <div className="flex space-x-2 animate-slideDown">
            <div className="relative flex-1">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                onBlur={handleCustomTip}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomTip();
                  }
                }}
                min="0"
                step="0.50"
                placeholder="Enter amount"
                className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-600"
              />
            </div>
            <button
              onClick={handleCustomTip}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Current Tip Display */}
      {selectedTip > 0 && (
        <div className="mt-4 bg-green-900/30 border border-green-600/30 rounded-lg p-3">
          <p className="text-green-400 text-sm font-medium text-center">
            ✨ Thank you! Your tip: {formatPrice(selectedTip)}
          </p>
        </div>
      )}
    </div>
  );
}
