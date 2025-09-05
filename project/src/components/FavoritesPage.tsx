import React from 'react';
import { Heart, Star, Clock, Trash2 } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import MenuItemCard from './MenuItemCard';

export const FavoritesPage: React.FC = () => {
  const { favorites, clearFavorites, getFavoritesByCategory } = useFavorites();
  const { t } = useLanguage();
  const { addToCart } = useCart();

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-black pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <Heart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">{t('noFavorites')}</h1>
            <p className="text-gray-400 text-lg">
              {t('noFavoritesDescription')}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            <p>{t('favoritesHelpText')}</p>
          </div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(favorites.map(item => item.category))];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-white">{t('myFavorites')}</h1>
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {favorites.length}
            </span>
          </div>
          
          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('clearFavorites')}</span>
            </button>
          )}
        </div>

        {/* Quick Add All to Cart */}
        <div className="mb-8 p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{t('quickOrder')}</h3>
              <p className="text-gray-400 text-sm">{t('quickOrderDescription')}</p>
            </div>
            <button
              onClick={() => favorites.forEach(item => addToCart(item))}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              {t('addAllToCart')}
            </button>
          </div>
        </div>

        {/* Favorites by Category */}
        {categories.map(category => {
          const categoryItems = getFavoritesByCategory(category);
          
          return (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <span>{category}</span>
                <span className="text-sm bg-gray-800 text-gray-300 px-2 py-1 rounded">
                  {categoryItems.length} {t('items')}
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryItems.map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Favorites Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <Heart className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{favorites.length}</div>
            <div className="text-gray-400 text-sm">{t('totalFavorites')}</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {favorites.filter(item => item.chefRecommended).length}
            </div>
            <div className="text-gray-400 text-sm">{t('chefRecommended')}</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white mb-1">
              {Math.round(favorites.reduce((acc, item) => {
                const time = parseInt(item.preparationTime?.split('-')[0] || '0');
                return acc + time;
              }, 0) / favorites.length) || 0}min
            </div>
            <div className="text-gray-400 text-sm">{t('averagePrepTime')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
