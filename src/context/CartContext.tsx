import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string;
  discount: number;
  lockedRestaurantId: string | null; // NEW: Track which restaurant cart is locked to
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'APPLY_PROMO_CODE'; payload: string }
  | { type: 'REMOVE_PROMO_CODE' }
  | { type: 'SET_LOCKED_RESTAURANT'; payload: string | null }; // NEW: Set locked restaurant

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: MenuItem, customizations?: any[], quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (id: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
  clearCartAndSwitchRestaurant: (restaurantId: string) => void; // NEW: Clear cart and switch restaurant
  canAddItemFromRestaurant: (restaurantId: string) => boolean; // NEW: Check if item can be added
  getLockedRestaurantId: () => string | null; // NEW: Get locked restaurant
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(item =>
        item.menuItem.id === action.payload.menuItem.id &&
        JSON.stringify(item.customizations) === JSON.stringify(action.payload.customizations)
      );

      let newItems;
      if (existingItemIndex !== -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;
        updatedItems[existingItemIndex].totalPrice =
          updatedItems[existingItemIndex].menuItem.basePrice * updatedItems[existingItemIndex].quantity +
          updatedItems[existingItemIndex].customizations.reduce((sum, c) => sum + c.price, 0) * updatedItems[existingItemIndex].quantity;

        newItems = updatedItems;
      } else {
        newItems = [...state.items, action.payload];
      }

      const newSubtotal = newItems.reduce((total, item) => total + item.totalPrice, 0);
      const newDiscount = state.promoCode && state.promoCode.toLowerCase() === 'mr.happy' ? newSubtotal * 0.1 : 0;

      // NEW: Lock cart to restaurant when first item is added
      const newLockedRestaurantId = state.lockedRestaurantId || action.payload.menuItem.restaurantId;

      return { 
        ...state, 
        items: newItems, 
        discount: newDiscount,
        lockedRestaurantId: newLockedRestaurantId 
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      const filteredSubtotal = filteredItems.reduce((total, item) => total + item.totalPrice, 0);
      const filteredDiscount = state.promoCode && state.promoCode.toLowerCase() === 'mr.happy' ? filteredSubtotal * 0.1 : 0;

      return {
        ...state,
        items: filteredItems,
        discount: filteredDiscount
      };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? {
              ...item,
              quantity: action.payload.quantity,
              totalPrice: (item.menuItem.basePrice +
                item.customizations.reduce((sum, c) => sum + c.price, 0)) * action.payload.quantity
            }
          : item
      );

      const updatedSubtotal = updatedItems.reduce((total, item) => total + item.totalPrice, 0);
      const updatedDiscount = state.promoCode && state.promoCode.toLowerCase() === 'mr.happy' ? updatedSubtotal * 0.1 : 0;

      return {
        ...state,
        items: updatedItems,
        discount: updatedDiscount
      };

    case 'CLEAR_CART':
      return { ...state, items: [], discount: 0, lockedRestaurantId: null }; // NEW: Unlock restaurant when cart is cleared

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'APPLY_PROMO_CODE':
      const code = action.payload.toLowerCase();
      if (code === 'mr.happy') {
        const subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0);
        const discount = subtotal * 0.1;
        return { ...state, promoCode: action.payload, discount };
      }
      return { ...state, promoCode: '', discount: 0 };

    case 'REMOVE_PROMO_CODE':
      return { ...state, promoCode: '', discount: 0 };

    case 'SET_LOCKED_RESTAURANT':
      return { ...state, lockedRestaurantId: action.payload };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    promoCode: '',
    discount: 0,
    lockedRestaurantId: null // NEW: Initialize as null
  });

  const addToCart = (menuItem: MenuItem, customizations: any[] = [], quantity: number = 1): { success: boolean; message?: string } => {
    // NEW: Check if cart is locked to a different restaurant
    if (state.lockedRestaurantId && state.lockedRestaurantId !== menuItem.restaurantId) {
      return {
        success: false,
        message: `Your cart contains items from another restaurant. Please complete or clear your current order first.`
      };
    }

    const customizationPrice = customizations.reduce((sum, c) => sum + c.price, 0);
    const totalPrice = (menuItem.basePrice + customizationPrice) * quantity;

    const cartItem: CartItem = {
      id: `${menuItem.id}-${Date.now()}-${Math.random()}`,
      menuItem,
      quantity,
      customizations,
      totalPrice
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });

    // Automatically open cart when item is added
    setTimeout(() => {
      dispatch({ type: 'OPEN_CART' });
    }, 100);

    return { success: true };
  };

  const removeFromCart = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    const subtotal = state.items.reduce((total, item) => total + item.totalPrice, 0);
    return subtotal - state.discount;
  };

  const applyPromoCode = (code: string) => {
    dispatch({ type: 'APPLY_PROMO_CODE', payload: code });
  };

  const removePromoCode = () => {
    dispatch({ type: 'REMOVE_PROMO_CODE' });
  };

  // NEW: Clear cart and switch to a new restaurant
  const clearCartAndSwitchRestaurant = (restaurantId: string) => {
    dispatch({ type: 'CLEAR_CART' });
    dispatch({ type: 'SET_LOCKED_RESTAURANT', payload: restaurantId });
  };

  // NEW: Check if an item from a specific restaurant can be added
  const canAddItemFromRestaurant = (restaurantId: string): boolean => {
    return !state.lockedRestaurantId || state.lockedRestaurantId === restaurantId;
  };

  // NEW: Get the currently locked restaurant ID
  const getLockedRestaurantId = (): string | null => {
    return state.lockedRestaurantId;
  };

  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      getTotalItems,
      getTotalPrice,
      applyPromoCode,
      removePromoCode,
      clearCartAndSwitchRestaurant,
      canAddItemFromRestaurant,
      getLockedRestaurantId
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
