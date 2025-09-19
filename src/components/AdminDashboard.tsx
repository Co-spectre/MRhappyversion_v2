import { useAdmin } from '../context/AdminContext';
import { AdminOrdersPanel } from './admin/AdminOrdersPanel';
import { 
  ArrowLeft,
  Plus,
  Clock,
  Bell,
  CheckCircle
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateBack?: () => void;
}

export function AdminDashboard({ onNavigateBack }: AdminDashboardProps) {
  const { state } = useAdmin();

  // Function to create a demo order for testing
  const createDemoOrder = () => {
    const demoOrder = {
      id: `ORDER-${Date.now()}`,
      userId: 'demo-customer',
      items: [
        {
          id: `item-${Date.now()}`,
          menuItem: {
            id: 'doner-demo',
            name: 'Demo Döner',
            description: 'A test döner for demonstration',
            basePrice: 8.50,
            image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80',
            category: 'döner',
            restaurantId: 'doner',
            dietaryInfo: { vegetarian: false, vegan: false, glutenFree: false, spicy: 2, halal: true },
            allergens: ['gluten', 'dairy'],
            calories: 650,
            ingredients: ['döner-fleisch', 'tomate', 'zwiebeln'],
            customizable: true,
            popular: true,
          },
          quantity: 1,
          customizations: [],
          totalPrice: 8.50,
        },
      ],
      subtotal: 8.50,
      tax: 0,
      deliveryFee: 0,
      tip: 0,
      total: 8.50,
      status: 'pending' as const,
      orderType: 'pickup' as const,
      estimatedTime: '15-20 mins',
      createdAt: new Date(),
      updatedAt: new Date(),
      customerInfo: {
        name: 'Test Customer',
        phone: '+49 421 123456',
        email: 'test@mrhappy.de',
      },
    };

    // Add order through the gateway
    import('../services/OrderGateway').then(({ orderGateway }) => {
      orderGateway.addOrder(demoOrder);
    });
  };

  const pendingOrdersCount = state.orders.filter(order => order.status === 'pending').length;
  const preparingOrdersCount = state.orders.filter(order => order.status === 'preparing').length;
  const readyOrdersCount = state.orders.filter(order => order.status === 'ready').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {onNavigateBack && (
                <button
                  onClick={onNavigateBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Mr. Happy - Order Management</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">
                  {pendingOrdersCount} Pending
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  {preparingOrdersCount} Preparing
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  {readyOrdersCount} Ready
                </span>
              </div>
              
              <button
                onClick={createDemoOrder}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Demo Order</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminOrdersPanel />
      </main>
    </div>
  );
}