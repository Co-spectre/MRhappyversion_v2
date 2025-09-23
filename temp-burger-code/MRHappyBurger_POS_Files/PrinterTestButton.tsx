import React, { useState } from 'react';
import { Printer, Check, X, Loader2 } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

const PrinterTestButton: React.FC = () => {
  const { testPrinter } = useOrder();
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<boolean | null>(null);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const result = await testPrinter();
      setLastTestResult(result);
      setLastTestTime(new Date());
    } catch (error) {
      setLastTestResult(false);
      setLastTestTime(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-3">🖨️ SAM4S Printer Test</h3>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleTest}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Printer className="w-4 h-4" />
          )}
          {isLoading ? 'Testing...' : 'Test Printer'}
        </button>

        {lastTestResult !== null && (
          <div className="flex items-center gap-2">
            {lastTestResult ? (
              <div className="flex items-center gap-1 text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm">Printer OK</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-400">
                <X className="w-4 h-4" />
                <span className="text-sm">Print Failed</span>
              </div>
            )}
            {lastTestTime && (
              <span className="text-xs text-gray-400">
                {lastTestTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-400">
        <p>
          This will print a test receipt on your SAM4S thermal printer. 
          Make sure your printer is connected and ready.
        </p>
      </div>
    </div>
  );
};

export default PrinterTestButton;
