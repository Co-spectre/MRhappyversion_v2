import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import PayPalService from '../services/PayPalService';

interface PayPalPaymentProps {
  amount: number;
  description: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const PayPalPayment: React.FC<PayPalPaymentProps> = ({
  amount,
  description,
  onSuccess,
  onError,
  onCancel,
  disabled = false
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // PayPal Client ID - In production, this should be from environment variables
  const PAYPAL_CLIENT_ID = 'AYGPWLgD7XZ8GzjPVi3mHqBE2FNE9PdTZUg8QUF5ZJKw7CyZ8Y1V8oJ3TGKkPPaQcMfTzX7VNHzVNnKdQ'; // Demo client ID

  useEffect(() => {
    const initializePayPal = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize PayPal SDK
        await PayPalService.initializePayPal(PAYPAL_CLIENT_ID);
        setIsInitialized(true);
        
        // Render PayPal buttons
        if (paypalRef.current) {
          const containerId = `paypal-container-${Math.random().toString(36).substr(2, 9)}`;
          paypalRef.current.id = containerId;

          PayPalService.renderPayPalButtons(
            containerId,
            amount,
            description,
            (transactionId: string) => {
              setIsProcessing(false);
              onSuccess(transactionId);
            },
            (errorMsg: string) => {
              setIsProcessing(false);
              setError(errorMsg);
              onError(errorMsg);
            },
            () => {
              setIsProcessing(false);
              onCancel();
            }
          );
        }

        setIsLoading(false);
      } catch (err) {
        console.error('PayPal initialization failed:', err);
        setError('Failed to load PayPal. Please try again or use a different payment method.');
        setIsLoading(false);
        onError('PayPal initialization failed');
      }
    };

    if (!disabled && amount > 0) {
      initializePayPal();
    }

    // Cleanup function
    return () => {
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    };
  }, [amount, description, disabled, onSuccess, onError, onCancel]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setIsInitialized(false);
    
    // Re-trigger initialization
    setTimeout(() => {
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    }, 100);
  };

  if (disabled) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 text-center">
        <div className="text-gray-500">
          PayPal payment is currently unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-2">
        <strong>Total: €{amount.toFixed(2)}</strong>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading PayPal...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Payment Error</span>
          </div>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Processing your payment...</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Please wait while we process your PayPal payment.
          </p>
        </div>
      )}

      {/* PayPal Button Container */}
      <div 
        ref={paypalRef} 
        className={`transition-opacity ${isLoading || error ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
        style={{ minHeight: '55px' }}
      />

      {/* Success Message (if needed) */}
      {isInitialized && !isLoading && !error && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">PayPal is ready</span>
          </div>
          <p className="text-green-700 text-xs mt-1">
            Click the PayPal button above to complete your payment securely.
          </p>
        </div>
      )}

      {/* Payment Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Secure payment processing through PayPal</p>
        <p>• Your financial information is protected</p>
        <p>• You can pay with your PayPal balance, bank account, or card</p>
      </div>
    </div>
  );
};

export default PayPalPayment;