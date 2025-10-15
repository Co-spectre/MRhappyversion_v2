import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useAuth } from '../context/AuthContext';
import { AdminOrdersPanel } from './admin/AdminOrdersPanel';
import { 
  ArrowLeft,
  Clock,
  Bell,
  CheckCircle,
  Volume2,
  VolumeX,
  MapPin
} from 'lucide-react';
import { notificationSound } from '../utils/notificationSound';

interface AdminDashboardProps {
  onNavigateBack?: () => void;
}

// Helper function to get restaurant display name
const getRestaurantName = (restaurantId: string): string => {
  const names: Record<string, string> = {
    'doner': 'Mr. Happy Döner (Vegesack)',
    'burger': 'Mr. Happy Burger (Vegesack)',
    'doner-pizza': 'Mr. Happy Döner & Pizza (Schwanewede)'
  };
  return names[restaurantId] || restaurantId;
};

export function AdminDashboard({ onNavigateBack }: AdminDashboardProps) {
  const { state, setRestaurant } = useAdmin();
  const { state: authState } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Set restaurant filter based on logged-in admin
  useEffect(() => {
    if (authState.user?.role === 'restaurant-admin' && authState.user.restaurantId) {
      setRestaurant(authState.user.restaurantId);
    } else {
      // Super admin sees all
      setRestaurant(null);
    }
  }, [authState.user, setRestaurant]);

  // Demo order functionality removed for production

  const pendingOrdersCount = state.orders.filter(order => order.status === 'pending').length;
  const preparingOrdersCount = state.orders.filter(order => order.status === 'preparing').length;
  const readyOrdersCount = state.orders.filter(order => order.status === 'ready').length;

  const toggleSound = () => {
    if (soundEnabled) {
      notificationSound.disable();
      setSoundEnabled(false);
    } else {
      notificationSound.enable();
      setSoundEnabled(true);
      // Play a test sound
      notificationSound.playNotification();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Restaurant Banner - Show if filtering by restaurant */}
      {state.restaurantId && (
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-b-2 border-blue-500">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <p className="text-blue-200 text-sm sm:text-base font-medium">
                📍 Restaurant Admin: <strong className="text-white">{getRestaurantName(state.restaurantId)}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
      
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
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {state.restaurantId ? getRestaurantName(state.restaurantId) : 'Mr. Happy - Bestellverwaltung'}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm">
              {/* Sound Toggle Button */}
              <button
                onClick={toggleSound}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  soundEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                }`}
                title={soundEnabled ? 'Benachrichtigungston deaktivieren' : 'Benachrichtigungston aktivieren'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="font-medium hidden sm:inline">
                  {soundEnabled ? 'Ton An' : 'Ton Aus'}
                </span>
              </button>

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