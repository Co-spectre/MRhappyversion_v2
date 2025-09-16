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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {restaurants.map((restaurant, index) => (
            <div
              key={restaurant.id}
              className={`group cursor-pointer transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${
                isVisible 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-12 opacity-0'
              }`}
              onClick={() => onRestaurantSelect(restaurant.id)}
              style={{ transitionDelay: `${400 + index * 200}ms` }}
            >
              <div className="bg-gray-800/60 backdrop-blur-md rounded-3xl overflow-hidden border border-gray-700/50 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-500 h-full">
                {/* Image */}
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Restaurant Icon */}
                  <div className="absolute top-6 left-6 w-16 h-16 bg-gray-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-gray-600/50">
                    {restaurant.type === 'doner' && <UtensilsCrossed className="w-7 h-7 text-red-400" />}
                    {restaurant.type === 'burger' && <Beef className="w-7 h-7 text-red-400" />}
                    {restaurant.type === 'restaurant' && <ChefHat className="w-7 h-7 text-red-400" />}
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-6 right-6 bg-yellow-500/90 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-xl">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-white fill-current" />
                      <span className="text-white font-bold text-sm">{restaurant.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-3xl font-light text-white mb-4 group-hover:text-red-400 transition-colors duration-300">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed text-base">
                    {restaurant.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6 p-5 bg-gray-700/60 rounded-2xl border border-gray-600/50">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Clock className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-medium">{restaurant.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Truck className="w-5 h-5 text-red-400" />
                      <span className="text-sm font-medium">€{restaurant.deliveryFee}</span>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-8">
                    <h4 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">{t('about.restaurants.specialties')}</h4>
                    <div className="flex flex-wrap gap-3">
                      {restaurant.specialties.slice(0, 3).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 text-sm rounded-full border border-red-500/30 backdrop-blur-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 group-hover:shadow-xl hover:shadow-red-500/40 flex items-center justify-center space-x-3 group/btn transform hover:scale-105">
                    <span className="text-lg">{t('restaurant.viewMenu')}</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" />
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