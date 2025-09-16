import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../context/LanguageContext';
import { AdminOrdersPanel } from './admin/AdminOrdersPanel';
import { AdminInventoryPanel } from './admin/AdminInventoryPanel';
import { AdminUsersPanel } from './admin/AdminUsersPanel';
import { AdminAnalyticsPanel } from './admin/AdminAnalyticsPanel';
import { AdminJobsPanel } from './admin/AdminJobsPanel';
import { 
  ClipboardList, 
  Package, 
  Users, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ArrowLeft,
  Plus,
  Briefcase
} from 'lucide-react';

type AdminTab = 'orders' | 'inventory' | 'users' | 'analytics' | 'jobs' | 'settings';

interface AdminDashboardProps {
  onNavigateBack?: () => void;
}

export function AdminDashboard({ onNavigateBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { state } = useAdmin();
  const { t } = useLanguage();

  // Detect iPad for optimized touch targets
  const isIpad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document;
  const touchClassNames = isIpad ? 'min-h-[44px] text-lg' : '';

  // Function to create a demo order for testing
  const createDemoOrder = () => {
    const demoOrder = {
      id: `ORDER-${Date.now()}`,
      userId: 'demo-customer',
      items: [
        {
          id: `item-${Date.now()}`,
          menuItem: {
            id: 'burger-demo',
            name: 'Demo Burger',
            description: 'A test burger for demonstration',
            basePrice: 12.99,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
            category: 'burgers',
            restaurantId: 'mr-happy',
            dietaryInfo: { vegetarian: false, vegan: false, glutenFree: false, spicy: 2 },
            allergens: ['gluten', 'dairy'],
            calories: 650,
            ingredients: ['beef patty', 'cheese', 'lettuce'],
            customizable: true,
            popular: true,
          },
          quantity: 2,
          customizations: [],
          totalPrice: 25.98,
        },
      ],
      subtotal: 25.98,
      tax: 0,
      deliveryFee: 0,
      tip: 0,
      total: 25.98,
      status: 'pending' as const,
      orderType: 'pickup' as const,
      estimatedTime: '15-20 mins',
      createdAt: new Date(),
      updatedAt: new Date(),
      customerInfo: {
        name: 'Test Customer',
        phone: '+49 123 456789',
        email: 'test@example.com',
      },
    };

    // Add order through the gateway
    import('../services/OrderGateway').then(({ orderGateway }) => {
      orderGateway.addOrder(demoOrder);
    });
  };

  const tabs = [
    { id: 'orders' as AdminTab, label: t('admin.orders') || 'Orders', icon: ClipboardList, count: state.orders.length },
    { id: 'inventory' as AdminTab, label: t('admin.inventory') || 'Inventory', icon: Package, count: state.inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length },
    { id: 'users' as AdminTab, label: t('admin.users') || 'Users', icon: Users, count: state.users.length },
    { id: 'jobs' as AdminTab, label: t('admin.jobs') || 'Jobs', icon: Briefcase, count: JSON.parse(localStorage.getItem('jobApplications') || '[]').length },
    { id: 'analytics' as AdminTab, label: t('admin.analytics') || 'Analytics', icon: BarChart3 },
    { id: 'settings' as AdminTab, label: t('admin.settings') || 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <AdminOrdersPanel />;
      case 'inventory':
        return <AdminInventoryPanel />;
      case 'users':
        return <AdminUsersPanel />;
      case 'jobs':
        return <AdminJobsPanel />;
      case 'analytics':
        return <AdminAnalyticsPanel />;
      case 'settings':
        return <div className="p-6 text-gray-400">Settings panel coming soon...</div>;
      default:
        return <AdminOrdersPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {isSidebarOpen && (
            <div>
              <h2 className="text-xl font-bold text-white">Mr.Happy Admin</h2>
              <p className="text-sm text-gray-400">Restaurant Management</p>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors ${touchClassNames}`}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${touchClassNames} ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                title={!isSidebarOpen ? tab.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <>
                    <span className="font-medium">{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                        isActive ? 'bg-red-700' : 'bg-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Back to Restaurant Button */}
        <div className="p-4 border-t border-gray-700 mt-auto">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-all duration-200"
              title={!isSidebarOpen ? 'Back to Restaurant' : undefined}
            >
              <ArrowLeft className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium">Back to Restaurant</span>}
            </button>
          )}
        </div>

        {/* Remove the sticky user profile section completely */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
              <p className="text-gray-400 text-sm">
                {activeTab === 'orders' && `${state.orders.length} total orders`}
                {activeTab === 'inventory' && `${state.inventory.length} items in stock`}
                {activeTab === 'users' && `${state.users.length} registered users`}
                {activeTab === 'analytics' && 'Performance overview'}
                {activeTab === 'settings' && 'System configuration'}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Demo Order Button for Testing */}
              {activeTab === 'orders' && (
                <button
                  onClick={createDemoOrder}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  title="Create a demo order for testing"
                >
                  <Plus className="w-4 h-4" />
                  <span>Demo Order</span>
                </button>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Admin User Info */}
              <div className="flex items-center space-x-3 bg-gray-700 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-sm font-medium">Admin User</p>
                  <p className="text-gray-400 text-xs">admin@mrhappy.com</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
