import React, { useState } from 'react';
import { Plus, Star, Clock, Leaf, Flame, Award, Info, Heart } from 'lucide-react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';

interface MenuItemCardProps {
  item: MenuItem;
  onCustomizeClick?: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onCustomizeClick }) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [showNutrition, setShowNutrition] = useState(false);

  const handleAddToCart = () => {
    if (onCustomizeClick) {
      onCustomizeClick(item);
    } else {
      addToCart(item);
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id);
    } else {
      addToFavorites(item);
    }
  };

  const getDietaryIcons = () => {
    const icons = [];
    if (item.dietaryInfo?.vegetarian) {
      icons.push(<Leaf key="veg" className="w-4 h-4 text-green-500" />);
    }
    if (item.dietaryInfo?.vegan) {
      icons.push(<Leaf key="vegan" className="w-4 h-4 text-green-600" />);
    }
    if (item.dietaryInfo?.halal) {
      icons.push(<div key="halal" className="w-4 h-4 bg-green-700 rounded-full text-xs text-white flex items-center justify-center font-bold">H</div>);
    }
    return icons;
  };

  const getSpicyLevel = () => {
    const level = item.dietaryInfo?.spicy || 0;
    return Array.from({ length: 3 }, (_, i) => (
      <Flame 
        key={i} 
        className={`w-3 h-3 ${i < level ? 'text-red-500' : 'text-gray-600'}`} 
      />
    ));
  };

  const displayName = item.name;

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-red-600 transition-all duration-300 group flex-1 flex flex-col">
        <div className="relative">
          <img 
            src={item.image} 
            alt={displayName}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
              isFavorite(item.id) 
                ? 'bg-red-600 text-white' 
                : 'bg-black/50 text-gray-300 hover:bg-red-600 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite(item.id) ? 'fill-current' : ''}`} />
          </button>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {item.onlineDiscount && (
              <span className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse shadow-lg">
                🔥 {item.onlineDiscount.percentage}% OFF
              </span>
            )}
            {item.popular && (
              <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" />
                {t('popular')}
              </span>
            )}
            {item.chefRecommended && (
              <span className="bg-yellow-600 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Award className="w-3 h-3" />
                {t('chefChoice')}
              </span>
            )}
            {item.nutritionScore && (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                item.nutritionScore === 'A' ? 'bg-green-600 text-white' :
                item.nutritionScore === 'B' ? 'bg-yellow-600 text-black' :
                'bg-orange-600 text-white'
              }`}>
                {t('nutrition')} {item.nutritionScore}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 flex flex-col gap-1">
            {/* Dietary Icons */}
            <div className="flex gap-1">
              {getDietaryIcons()}
            </div>
            
            {/* Spicy Level */}
            {item.dietaryInfo?.spicy && item.dietaryInfo.spicy > 0 && (
              <div className="flex gap-0.5 bg-black/50 rounded px-1 py-0.5">
                {getSpicyLevel()}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
              {displayName}
            </h3>
            <div className="text-right">
              {item.onlineDiscount ? (
                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500 line-through">
                    €{item.onlineDiscount.originalPrice.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-red-600">
                      €{item.basePrice.toFixed(2)}
                    </span>
                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      -{item.onlineDiscount.percentage}%
                    </span>
                  </div>
                  <span className="text-xs text-green-400 font-medium">
                    Online Only!
                  </span>
                </div>
              ) : (
                <span className="text-xl font-bold text-red-600">
                  €{item.basePrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>

          {/* Additional Info Row */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{item.preparationTime}</span>
            </div>

            {item.origin && (
              <span className="italic">{item.origin}</span>
            )}

            <button
              onClick={() => setShowNutrition(!showNutrition)}
              className="flex items-center gap-1 hover:text-red-400 transition-colors"
            >
              <Info className="w-3 h-3" />
              {t('nutrition')}
            </button>
          </div>

          {/* Nutrition Info (Expandable) */}
          {showNutrition && (
            <div className="bg-gray-800 rounded-lg p-3 mb-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <div>{t('calories')}: <span className="text-white">{item.calories}</span></div>
                <div>{t('protein')}: <span className="text-white">{item.protein}g</span></div>
                <div>{t('carbs')}: <span className="text-white">{item.carbs}g</span></div>
                <div>{t('fat')}: <span className="text-white">{item.fat}g</span></div>
              </div>

              {item.allergens && item.allergens.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                  <div className="text-gray-500">{t('allergens')}:</div>
                  <div className="text-gray-400 text-xs">{item.allergens.join(', ')}</div>
                </div>
              )}
            </div>
          )}

          {/* Size Options */}
          {item.sizes && item.sizes.length > 1 && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">{t('sizes')}:</div>
              <div className="flex gap-2">
                {item.sizes.map((size, index) => (
                  <span key={index} className="text-xs bg-gray-800 px-2 py-1 rounded">
                    {size.name} (+€{((item.basePrice * size.priceMultiplier) - item.basePrice).toFixed(2)})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {t('addToCart')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuItemCard;
