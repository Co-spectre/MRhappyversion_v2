import { useAdmin } from '../context/AdminContext';
import { AdminOrdersPanel } from './admin/AdminOrdersPanel';
import { 
  ArrowLeft,
  Clock,
  Bell,
  CheckCircle
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateBack?: () => void;
}

export function AdminDashboard({ onNavigateBack }: AdminDashboardProps) {
  const { state } = useAdmin();

  // Demo order functionality removed for production

  const pendingOrdersCount = state.orders.filter(order => order.status === 'pending').length;
  const preparingOrdersCount = state.orders.filter(order => order.status === 'preparing').length;
  const readyOrdersCount = state.orders.filter(order => order.status === 'ready').length;

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex items-center space-x-4">
              {onNavigateBack && (
                <button
                  onClick={onNavigateBack}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-300" />
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-white">Mr. Happy - Bestellverwaltung</h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="font-medium text-gray-300">
                  {pendingOrdersCount} Wartend
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="font-medium text-gray-300">
                  {preparingOrdersCount} In Zubereitung
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <span className="font-medium text-gray-300">
                  {readyOrdersCount} Bereit
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AdminOrdersPanel />
      </main>
    </div>
  );
}