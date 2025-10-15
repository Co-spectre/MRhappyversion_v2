import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  History, 
  Heart, 
  Languages, 
  Shield, 
  UtensilsCrossed, 
  Beef, 
  ChefHat
} from './icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage, Language } from '../context/LanguageContext';
import EnhancedRegistrationModal from './EnhancedRegistrationModal';
import UserProfileModal from './UserProfileModal';

interface HeaderProps {
  currentRestaurant: string;
  onRestaurantChange: (restaurantId: string) => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentRestaurant, onRestaurantChange, currentView, onViewChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const { getTotalItems, getTotalPrice, dispatch } = useCart();
  const { state, logout, checkProfileComplete } = useAuth();
  const { language, setLanguage, t } = useLanguage();


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const restaurants = [
    { id: 'doner', name: 'Restaurant', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'burger', name: 'Burger', icon: <Beef className="w-4 h-4" /> },
    { id: 'doner-pizza', name: 'Döner&Pizza', icon: <ChefHat className="w-4 h-4" /> }
  ];

  const languages = [
    { 
      code: 'en' as Language, 
      name: 'English', 
      flag: '🇺🇸',
      shortName: 'EN'
    },
    { 
      code: 'de' as Language, 
      name: 'Deutsch', 
      flag: '🇩🇪',
      shortName: 'DE'
    },
    { 
      code: 'tr' as Language, 
      name: 'Türkçe', 
      flag: '🇹🇷',
      shortName: 'TR'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const navigationItems = [
    { id: 'home', name: t('nav.home'), active: currentView === 'home' },
    { id: 'menu', name: t('nav.menu'), active: currentView === 'menu' },
    { id: 'about', name: t('nav.about'), active: currentView === 'about' },
    { id: 'jobs', name: t('nav.jobs'), active: currentView === 'jobs' }
  ];

  const handleUserMenuClick = () => {
    if (state.isAuthenticated) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      setIsRegistrationModalOpen(true);
    }
  };



  const getProfileCompletionStatus = () => {
    if (!state.isAuthenticated) return null;
    const isComplete = checkProfileComplete();
    return {
      isComplete,
      icon: isComplete ? <User className="w-5 h-5 text-green-400" /> : <User className="w-5 h-5 text-orange-400" />,
      badgeColor: isComplete ? 'bg-green-500' : 'bg-orange-500'
    };
  };

  const profileStatus = getProfileCompletionStatus();

  return (
    <>
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-700' 
        : 'bg-gray-900/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => onViewChange('home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/mr-happy-logo.png" 
                alt="Mr. Happy Döner Logo" 
                className="h-8 w-auto md:h-10 object-contain"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Main Navigation */}
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                  item.active
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.name}
              </button>
            ))}
            
            {/* Restaurant Toggle (only show on menu page) */}
            {currentView === 'menu' && (
              <div className="flex items-center space-x-2 border-l border-gray-700 pl-8">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => onRestaurantChange(restaurant.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  currentRestaurant === restaurant.id
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                {restaurant.icon}
                <span className="font-medium">{restaurant.name}</span>
              </button>
            ))}
              </div>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">


            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                title={t('nav.switchLanguage')}
              >
                <span className="text-lg">{currentLanguage.flag}</span>
                <Languages className="w-4 h-4" />
              </button>

              {/* Language Dropdown Menu */}
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="py-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`flex items-center space-x-3 w-full px-4 py-3 text-left transition-all duration-200 group ${
                          language === lang.code
                            ? 'bg-red-500/20 text-red-400'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/80'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{lang.name}</span>
                          <span className="text-xs opacity-70">{lang.shortName}</span>
                        </div>
                        {language === lang.code && (
                          <div className="ml-auto w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Account */}
            <div className="relative">
              <button 
                onClick={handleUserMenuClick}
                className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white transition-colors relative"
              >
                {state.isAuthenticated && profileStatus ? (
                  <div className="relative">
                    {profileStatus.icon}
                    {!profileStatus.isComplete && (
                      <div className={`absolute -top-1 -right-1 w-3 h-3 ${profileStatus.badgeColor} rounded-full border-2 border-gray-900`} />
                    )}
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
                {state.isAuthenticated && (
                  <span className="hidden sm:block text-sm font-medium">{state.user?.name}</span>
                )}
              </button>
              
              {/* User Dropdown Menu */}
              {isUserMenuOpen && state.isAuthenticated && (
                <div className="absolute right-1/2 transform translate-x-1/2 mt-3 w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* User Info Section */}
                  <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center relative">
                        <User className="w-5 h-5 text-white" />
                        {!checkProfileComplete() && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-gray-900" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{state.user?.name}</p>
                        <p className="text-gray-300 text-xs">{state.user?.email}</p>
                        {!checkProfileComplete() && (
                          <p className="text-orange-400 text-xs mt-1">Profile incomplete</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-200 group h-14"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                        checkProfileComplete() 
                          ? 'bg-gray-700 group-hover:bg-green-600' 
                          : 'bg-orange-900/50 group-hover:bg-orange-600'
                      }`}>
                        <User className={`w-4 h-4 transition-colors ${
                          checkProfileComplete()
                            ? 'text-gray-300 group-hover:text-white'
                            : 'text-orange-400 group-hover:text-white'
                        }`} />
                      </div>
                      <span className="font-medium text-sm">Manage Profile</span>
                      {!checkProfileComplete() && (
                        <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onViewChange('orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-200 group h-14"
                    >
                      <div className="w-8 h-8 bg-gray-700 group-hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                        <History className="w-4 h-4 text-gray-300 group-hover:text-white" />
                      </div>
                      <span className="font-medium text-sm">{t('nav.orderHistory')}</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        onViewChange('my-orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-200 group h-14"
                    >
                      <div className="w-8 h-8 bg-gray-700 group-hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                        <ShoppingCart className="w-4 h-4 text-gray-300 group-hover:text-white" />
                      </div>
                      <span className="font-medium text-sm">{t('nav.myOrders')}</span>
                    </button>
                    
                    <button className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/80 transition-all duration-200 group h-14">
                      <div className="w-8 h-8 bg-gray-700 group-hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                        <Heart className="w-4 h-4 text-gray-300 group-hover:text-white" />
                      </div>
                      <span className="font-medium text-sm">{t('nav.favorites')}</span>
                    </button>

                    {/* Admin Panel Access - For admin and restaurant-admin users */}
                    {(state.user?.role === 'admin' || state.user?.role === 'restaurant-admin') && (
                      <>
                        <div className="border-t border-gray-600 my-2"></div>
                        <button
                          onClick={() => {
                            onViewChange('admin');
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/50 transition-all duration-200 group h-14"
                        >
                          <div className="w-8 h-8 bg-red-900/50 group-hover:bg-red-800 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                            <Shield className="w-4 h-4 text-red-400" />
                          </div>
                          <span className="font-medium text-sm">{t('nav.admin')}</span>
                        </button>
                      </>
                    )}

                    <div className="border-t border-gray-600 my-2"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-gray-300 hover:text-red-400 hover:bg-gray-700/80 transition-all duration-200 group h-14"
                    >
                      <div className="w-8 h-8 bg-gray-700 group-hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                        <LogOut className="w-4 h-4 text-gray-300 group-hover:text-white" />
                      </div>
                      <span className="font-medium text-sm">{t('nav.signOut')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative p-2 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse shadow-lg">
                  {getTotalItems()}
                </span>
              )}
              {/* Cart hover tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {getTotalItems() > 0 ? `${getTotalItems()} items - €${getTotalPrice().toFixed(2)}` : 'Cart is empty'}
              </div>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800/95 border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Main Navigation */}
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.active
                      ? 'bg-red-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              {/* Restaurant Selection (only on menu page) */}
              {currentView === 'menu' && (
                <div className="border-t border-gray-700 pt-2 mt-2">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => {
                    onRestaurantChange(restaurant.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    currentRestaurant === restaurant.id
                      ? 'bg-red-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {restaurant.icon}
                  <span>Mr.Happy {restaurant.name}</span>
                </button>
              ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
    
    {/* Enhanced Registration Modal */}
    <EnhancedRegistrationModal 
      isOpen={isRegistrationModalOpen} 
      onClose={() => setIsRegistrationModalOpen(false)} 
    />
    
    {/* User Profile Modal */}
    <UserProfileModal 
      isOpen={isProfileModalOpen} 
      onClose={() => setIsProfileModalOpen(false)} 
    />
    

    
    {/* Click outside to close user menu */}
    {isUserMenuOpen && (
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setIsUserMenuOpen(false)}
      />
    )}
    
    {/* Click outside to close language menu */}
    {isLanguageMenuOpen && (
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setIsLanguageMenuOpen(false)}
      />
    )}
    </>
  );
};

export default Header;