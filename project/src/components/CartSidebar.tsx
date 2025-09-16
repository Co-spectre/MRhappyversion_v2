import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OrderTypeSelector from './OrderTypeSelector';
import CheckoutModal from './CheckoutModal';

const CartSidebar: React.FC = () => {
  const { state, dispatch, getTotalPrice, removeFromCart } = useCart();
  const { state: authState, checkProfileComplete } = useAuth();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = React.useState(false);
  const [slideIn, setSlideIn] = React.useState(false);

  // Trigger slide-in animation when cart opens
  React.useEffect(() => {
    if (state.isOpen) {
      setSlideIn(true);
    } else {
      setSlideIn(false);
    }
  }, [state.isOpen]);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity: newQuantity } });
    }
  };

  const handleCheckout = () => {
    if (!authState.isAuthenticated) {
      alert('Please sign in to place an order');
      return;
    }
    
    if (state.items.length === 0) return;
    
    // Check if profile is complete
    if (!checkProfileComplete()) {
      alert('Please complete your profile before placing an order');
      return;
    }
    
    setIsCheckoutModalOpen(true);
  };
  const getCustomizationSummary = (customizations: any[]) => {
    if (customizations.length === 0) return 'No modifications';
    
    return customizations.map(c => {
      const ingredient = c.ingredientId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      const action = c.action === 'extra' ? 'Extra' : 
                   c.action === 'double' ? '2x' :
                   c.action === 'remove' ? 'No' : 'Add';
      return `${action} ${ingredient}`;
    }).join(', ');
  };

  if (!state.isOpen) return null;

  return (
    <>
      <div className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${state.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Background overlay */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${state.isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => dispatch({ type: 'CLOSE_CART' })} 
      />
      
      {/* Sidebar */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-md sm:max-w-lg bg-gray-900 shadow-2xl border-l border-gray-700 transform transition-all duration-300 ease-out ${
        slideIn ? 'translate-x-0 scale-100' : 'translate-x-full scale-95'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-red-900/20 to-transparent">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-red-500" />
                {state.items.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <h2 className="text-lg font-bold text-white">Cart</h2>
              {state.items.length > 0 && (
                <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                  {state.items.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </div>
            <button
              onClick={() => dispatch({ type: 'CLOSE_CART' })}
              className="p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-800 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Order Type Selector */}
          {state.items.length > 0 && (
            <div className="p-3 border-b border-gray-800">
              <OrderTypeSelector />
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3">
            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">Your cart is empty</p>
                <p className="text-gray-500 text-sm">Add some delicious items to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {state.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="bg-gradient-to-r from-black/60 to-gray-900/60 rounded-md p-3 border border-gray-700 hover:border-gray-600 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Item Image */}
                      <div className="relative group flex-shrink-0">
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-12 h-12 object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate hover:text-red-400 transition-colors">{item.menuItem.name}</h4>
                        <p className="text-xs text-gray-400 mb-1">
                          €{item.menuItem.basePrice.toFixed(2)}
                        </p>
                        
                        {/* Customizations */}
                        {item.customizations && item.customizations.length > 0 && (
                          <div className="mb-1">
                            <p className="text-xs text-gray-400 line-clamp-1">
                              {getCustomizationSummary(item.customizations)}
                            </p>
                          </div>
                        )}

                        {/* Quantity and Price */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1 bg-gray-800/50 rounded p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-0.5 bg-gray-700 text-white rounded hover:bg-red-600 transition-all duration-200"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-sm font-medium px-2 min-w-[1.5rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-0.5 bg-gray-700 text-white rounded hover:bg-green-600 transition-all duration-200"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-red-500 text-sm">
                              €{item.totalPrice.toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-all duration-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-gray-800 p-3 space-y-2 bg-gradient-to-t from-gray-900 to-transparent">
              {/* Order Summary */}
              <div className="space-y-1 bg-black/30 p-4 rounded-md border border-gray-700 text-lg">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>€{(state.items.reduce((total, item) => total + item.totalPrice, 0)).toFixed(2)}</span>
                </div>
                {state.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({state.promoCode})</span>
                    <span>-€{state.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-300">
                  <span>Pickup</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-gray-600 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-red-500">€{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button 
                  onClick={handleCheckout}
                  disabled={state.items.length === 0}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-xl hover:shadow-red-600/25 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {!authState.isAuthenticated ? (
                    'Sign In to Order'
                  ) : !checkProfileComplete() ? (
                    'Complete Profile to Order'
                  ) : state.items.length === 0 ? (
                    'Add Items to Order'
                  ) : (
                    `Proceed to Checkout - €${getTotalPrice().toFixed(2)}`
                  )}
                </button>
                <button 
                  onClick={() => dispatch({ type: 'CLEAR_CART' })}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] border border-gray-700 hover:border-gray-600"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Checkout Modal */}
    <CheckoutModal 
      isOpen={isCheckoutModalOpen}
      onClose={() => setIsCheckoutModalOpen(false)}
    />
    </>
  );
};

export default CartSidebar;