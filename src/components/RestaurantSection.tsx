import React, { useState, useEffect } from 'react';
import { restaurants } from '../data/restaurants';
import { Star, Clock, Truck, ArrowRight, UtensilsCrossed, Beef, ChefHat } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RestaurantSectionProps {
  onRestaurantSelect: (restaurantId: string) => void;
}

const RestaurantSection: React.FC<RestaurantSectionProps> = ({ onRestaurantSelect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className={`transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className="text-4xl md:text-5xl font-light text-white mb-6 leading-tight">
              {t('hero.discover')} <span className="font-normal text-red-500">{t('hero.kitchens')}</span>
            </h2>
            
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t('hero.description')}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {restaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className={`group cursor-pointer transform transition-all duration-700 hover:scale-102 ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-12 opacity-0'
              }`}
              onClick={() => onRestaurantSelect(restaurant.id)}
              style={{ transitionDelay: `${400 + index * 200}ms` }}
            >
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-700 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-500">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Restaurant Icon */}
                  <div className="absolute top-6 left-6 w-14 h-14 bg-gray-800/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-gray-600">
                    {restaurant.type === 'doner' && <UtensilsCrossed className="w-6 h-6 text-red-400" />}
                    {restaurant.type === 'burger' && <Beef className="w-6 h-6 text-red-400" />}
                    {restaurant.type === 'restaurant' && <ChefHat className="w-6 h-6 text-red-400" />}
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-light text-white mb-3 group-hover:text-red-400 transition-colors duration-300">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {restaurant.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6 p-4 bg-gray-700/50 rounded-2xl border border-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-gray-300 font-medium">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{restaurant.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Truck className="w-4 h-4" />
                      <span className="text-sm">€{restaurant.deliveryFee}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {restaurant.specialties.slice(0, 3).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1 bg-gray-600/50 text-gray-300 text-sm rounded-full border border-gray-600"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-medium transition-all duration-300 group-hover:shadow-lg hover:shadow-red-500/30 flex items-center justify-center space-x-2 group/btn">
                    <span>{t('restaurant.viewMenu')}</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <p className="text-gray-300 mb-4">
            {t('restaurant.cantDecide')}
          </p>
          <div className="flex items-center justify-center space-x-2 text-red-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium">{t('hero.trusted')}</span>
            <Star className="w-4 h-4 fill-current" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantSection;