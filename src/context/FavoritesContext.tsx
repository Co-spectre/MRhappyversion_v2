import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

interface FavoritesContextType {
  favorites: MenuItem[];
  addToFavorites: (item: MenuItem) => void;
  removeFromFavorites: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  getFavoritesByCategory: (category: string) => MenuItem[];
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const { state: authState } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();

  // Load favorites from localStorage when user changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      const savedFavorites = localStorage.getItem(`favorites_${authState.user.email}`);
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Error loading favorites:', error);
          setFavorites([]);
        }
      }
    } else {
      setFavorites([]);
    }
  }, [authState.isAuthenticated, authState.user]);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      localStorage.setItem(`favorites_${authState.user.email}`, JSON.stringify(favorites));
    }
  }, [favorites, authState.isAuthenticated, authState.user]);

  const addToFavorites = (item: MenuItem) => {
    if (!authState.isAuthenticated) {
      showToast(t('loginToSaveFavorites'), 'warning');
      return;
    }

    if (!isFavorite(item.id)) {
      setFavorites(prev => [...prev, item]);
      showToast(t('addedToFavorites'), 'success');
    }
  };

  const removeFromFavorites = (itemId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== itemId));
    showToast(t('removedFromFavorites'), 'success');
  };

  const isFavorite = (itemId: string) => {
    return favorites.some(item => item.id === itemId);
  };

  const getFavoritesByCategory = (category: string) => {
    return favorites.filter(item => item.category === category);
  };

  const clearFavorites = () => {
    setFavorites([]);
    showToast(t('favoritesCleared'), 'success');
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      getFavoritesByCategory,
      clearFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
