import { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AdminProvider } from './context/AdminContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { orderGateway } from './services/OrderGateway';
import Header from './components/Header';
import ParallaxHero from './components/ParallaxHero';
import RestaurantSection from './components/RestaurantSection';
import MenuSection from './components/MenuSection';
import CartSidebar from './components/CartSidebar';
import AboutPage from './components/AboutPage';
import OrderHistory from './components/OrderHistory';
import MyOrdersPage from './components/MyOrdersPage';
import LocationCardsPage from './components/LocationCardsPage';
import ImpressumPage from './components/ImpressumPage';
import JobsPage from './components/JobsPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import CookiePolicyPage from './components/CookiePolicyPage';
import AllergenInformationPage from './components/AllergenInformationPage';
import Footer from './components/Footer';
import TestimonialsSection from './components/TestimonialsSection';
import ChefShowcaseSection from './components/ChefShowcaseSection';
import SpecialOffersSection from './components/SpecialOffersSection';
import { AdminDashboard } from './components/AdminDashboard';
import { NotificationCenter } from './components/NotificationCenter';

// Component to handle notification gateway registration
function NotificationGatewayConnector() {
  const { addNotification } = useNotifications();
  const { state: authState } = useAuth();

  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      // Register user for notifications
      orderGateway.registerListener(authState.user.id, addNotification);

      return () => {
        // Cleanup listener on unmount or user change
        if (authState.user) {
          orderGateway.unregisterListener(authState.user.id);
        }
      };
    }
  }, [authState.isAuthenticated, authState.user, addNotification]);

  return null;
}

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <FavoritesProvider>
              <OrderProvider>
                <CartProvider>
                  <AdminProvider>
                    <AppContent />
                  </AdminProvider>
                </CartProvider>
              </OrderProvider>
            </FavoritesProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

function AppContent() {
  const { state: authState } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'menu' | 'about' | 'orders' | 'my-orders' | 'admin' | 'impressum' | 'jobs' | 'privacy' | 'terms' | 'cookies' | 'allergens'>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [viewTransition, setViewTransition] = useState(false);

  // Protect admin panel access
  useEffect(() => {
    if (currentView === 'admin' && (!authState.user || authState.user.role !== 'admin')) {
      setCurrentView('home');
    }
  }, [currentView, authState.user]);

  const handleViewChange = (view: string) => {
    // Additional protection for admin panel
    if (view === 'admin' && (!authState.user || authState.user.role !== 'admin')) {
      return; // Don't allow navigation to admin panel
    }
    
    if (view !== currentView) {
      setViewTransition(true);
      
      setTimeout(() => {
        setCurrentView(view as 'home' | 'menu' | 'about' | 'orders' | 'my-orders' | 'admin' | 'impressum' | 'jobs' | 'privacy' | 'terms' | 'cookies' | 'allergens');
        if (view === 'home') {
          setSelectedRestaurant('');
        }
        setViewTransition(false);
        
        // Smooth scroll to top for new views
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  };

  const handleRestaurantSelect = (restaurantId: string) => {
    setViewTransition(true);
    
    setTimeout(() => {
      setSelectedRestaurant(restaurantId);
      setCurrentView('menu');
      setViewTransition(false);
      
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  const handleRestaurantChange = (restaurantId: string) => {
    if (restaurantId !== selectedRestaurant) {
      setViewTransition(true);
      
      setTimeout(() => {
        setSelectedRestaurant(restaurantId);
        if (restaurantId && currentView !== 'menu') {
          setCurrentView('menu');
        }
        setViewTransition(false);
      }, 200);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <ParallaxHero onRestaurantSelect={handleRestaurantSelect} />
            <RestaurantSection onRestaurantSelect={handleRestaurantSelect} />
            <ChefShowcaseSection />
            <SpecialOffersSection />
            <TestimonialsSection />
          </>
        );
      case 'menu':
        if (selectedRestaurant) {
          // Show food items for selected restaurant
          return <MenuSection restaurantId={selectedRestaurant} />;
        } else {
          // Show location cards when no restaurant is selected
          return <LocationCardsPage onRestaurantSelect={handleRestaurantSelect} />;
        }
      case 'about':
        return <AboutPage />;
      case 'jobs':
        return <JobsPage />;
      case 'orders':
        return (
          <div className="bg-gray-900 min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <OrderHistory />
            </div>
          </div>
        );
      case 'my-orders':
        return <MyOrdersPage />;
      case 'impressum':
        return <ImpressumPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      case 'cookies':
        return <CookiePolicyPage />;
      case 'allergens':
        return <AllergenInformationPage />;
      default:
        return (
          <>
            <ParallaxHero onRestaurantSelect={handleRestaurantSelect} />
            <RestaurantSection onRestaurantSelect={handleRestaurantSelect} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {currentView === 'admin' ? (
        // Admin Dashboard - Full Screen (no header)
        <AdminDashboard onNavigateBack={() => setCurrentView('home')} />
      ) : (
        // Regular Application
        <>
          <Header 
            currentRestaurant={selectedRestaurant}
            onRestaurantChange={handleRestaurantChange}
            currentView={currentView}
            onViewChange={handleViewChange}
          />
          
          {/* Loading Overlay */}
          {viewTransition && (
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
              <div className="flex items-center justify-center h-full">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
                  <span className="text-white">Loading...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Content with Transition */}
          <div className={`transition-opacity duration-300 ${viewTransition ? 'opacity-50' : 'opacity-100'}`}>
            {renderCurrentView()}
          </div>
          
          {/* Footer */}
          <Footer onViewChange={handleViewChange} />
          
          <CartSidebar />
          
          {/* Notification Gateway Connector */}
          <NotificationGatewayConnector />
          
          {/* Notification Center */}
          <NotificationCenter />
        </>
      )}
    </div>
  );
}

export default App;