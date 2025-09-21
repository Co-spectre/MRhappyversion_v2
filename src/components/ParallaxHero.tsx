import React, { useEffect, useState } from 'react';
import { ArrowRight, UtensilsCrossed, Beef, ChefHat, Facebook, Instagram, Twitter, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ParallaxHeroProps {
  onRestaurantSelect?: (restaurantId: string) => void;
}

const ParallaxHero: React.FC<ParallaxHeroProps> = ({ onRestaurantSelect }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    
    window.addEventListener('scroll', handleScroll);
    
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 300);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900" style={{ height: '100vh' }}>
      {/* Beautiful Restaurant Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      {/* Dark overlay to dim the background */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Additional gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-black/80" />
      
      {/* Subtle Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Content - Properly centered and responsive */}
      <div className="relative z-10 flex items-center justify-center px-4 py-8 sm:py-12 md:py-16" style={{ 
        minHeight: '100vh',
        paddingTop: 'max(80px, 5vh)', // Ensure space for header + buffer
        paddingBottom: 'max(40px, 3vh)' // Ensure space at bottom
      }}>
        <div className="text-center max-w-7xl mx-auto flex flex-col justify-center" style={{ 
          minHeight: 'calc(100vh - 120px)' // Account for header and padding
        }}>
          {/* Enhanced and Responsive Main Logo/Title */}
          <div 
            className={`transform transition-all duration-1000 ease-out mb-8 md:mb-12 lg:mb-16 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          >
            <div className="flex justify-center mb-4 md:mb-6 lg:mb-8">
              <img 
                src="/mr-happy-logo.png" 
                alt="Mr. Happy Döner Logo" 
                className="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 w-auto object-contain drop-shadow-2xl max-w-full"
              />
            </div>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-200 font-light max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto drop-shadow-lg px-4">
              {t('hero.subtitle')}
            </p>
          </div>
          
          {/* Enhanced and Responsive Restaurant Cards */}
          <div 
            className={`grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 px-4 sm:px-6 md:px-8 lg:px-0 transform transition-all duration-1000 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}
            style={{ 
              transform: `translateY(${scrollY * 0.05}px)`,
              transitionDelay: '400ms'
            }}
          >
            <div 
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => onRestaurantSelect?.('doner')}
            >
              <div className="bg-gray-800/70 backdrop-blur-md border border-gray-600/50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 hover:border-red-500/70 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:bg-gray-700/80 h-full flex flex-col">
                <div className="mb-4 md:mb-6 lg:mb-8 transition-transform duration-300 group-hover:scale-110 flex justify-center flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-red-500/30 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:bg-red-500/40 transition-colors">
                    <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-red-400" />
                  </div>
                </div>
                <div className="flex-grow flex flex-col">
                  <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-light text-white mb-2 md:mb-3 lg:mb-4 group-hover:text-red-100 transition-colors text-center">{t('restaurant.doner.name')}</h3>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 md:mb-6 lg:mb-8 leading-relaxed text-center flex-grow">
                    {t('restaurant.doner.desc')}
                  </p>
                  <div className="text-center mb-4 md:mb-6 flex-shrink-0">
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs sm:text-sm mb-1 md:mb-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
                      <span>Bremen Vegesack Kaufland</span>
                    </div>
                    <div className="text-gray-500 text-xs sm:text-sm mb-1 md:mb-2">Zum Alten Speicher 1 · 28759 Bremen</div>
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>Daily 08:00 - 20:00</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-red-400 text-sm sm:text-base md:text-lg font-medium group-hover:text-red-300 transition-colors flex-shrink-0">
                    {t('hero.explore')} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => onRestaurantSelect?.('burger')}
            >
              <div className="bg-gray-800/70 backdrop-blur-md border border-gray-600/50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 hover:border-red-500/70 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:bg-gray-700/80 h-full flex flex-col">
                <div className="mb-4 md:mb-6 lg:mb-8 transition-transform duration-300 group-hover:scale-110 flex justify-center flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-red-500/30 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:bg-red-500/40 transition-colors">
                    <Beef className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-red-400" />
                  </div>
                </div>
                <div className="flex-grow flex flex-col">
                  <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-light text-white mb-2 md:mb-3 lg:mb-4 group-hover:text-red-100 transition-colors text-center">{t('restaurant.burger.name')}</h3>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 md:mb-6 lg:mb-8 leading-relaxed text-center flex-grow">
                    {t('restaurant.burger.desc')}
                  </p>
                  <div className="text-center mb-4 md:mb-6 flex-shrink-0">
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs sm:text-sm mb-1 md:mb-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
                      <span>Bremen Vegesack Kaufland</span>
                    </div>
                    <div className="text-gray-500 text-xs sm:text-sm mb-1 md:mb-2">Zum Alten Speicher 1 · 28759 Bremen</div>
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>Daily 08:00 - 20:00</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-red-400 text-sm sm:text-base md:text-lg font-medium group-hover:text-red-300 transition-colors flex-shrink-0">
                    {t('hero.explore')} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
            
            <div 
              className="group cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={() => onRestaurantSelect?.('doner-pizza')}
            >
              <div className="bg-gray-800/70 backdrop-blur-md border border-gray-600/50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 hover:border-red-500/70 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:bg-gray-700/80 h-full flex flex-col">
                <div className="mb-4 md:mb-6 lg:mb-8 transition-transform duration-300 group-hover:scale-110 flex justify-center flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-red-500/30 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:bg-red-500/40 transition-colors">
                    <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-red-400" />
                  </div>
                </div>
                <div className="flex-grow flex flex-col">
                  <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-light text-white mb-2 md:mb-3 lg:mb-4 group-hover:text-red-100 transition-colors text-center">{t('restaurant.doner-pizza.name')}</h3>
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 md:mb-6 lg:mb-8 leading-relaxed text-center flex-grow">
                    {t('restaurant.doner-pizza.desc')}
                  </p>
                  <div className="text-center mb-4 md:mb-6 flex-shrink-0">
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs sm:text-sm mb-1 md:mb-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
                      <span>Bremen-Heidkamp</span>
                    </div>
                    <div className="text-gray-500 text-xs sm:text-sm mb-1 md:mb-2">Bremen-Heidkamp 25 · 28790 Schwanewede</div>
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                      <span>Daily 11:00 - 22:00</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-red-400 text-sm sm:text-base md:text-lg font-medium group-hover:text-red-300 transition-colors flex-shrink-0">
                    {t('hero.explore')} <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Social Media Section */}
          <div
            className={`mt-8 md:mt-12 lg:mt-16 transform transition-all duration-1000 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{
              transform: `translateY(${scrollY * 0.03}px)`,
              transitionDelay: '500ms'
            }}
          >
            <div className="text-center">
              <h3 className="text-lg md:text-xl font-light text-white mb-4 md:mb-6">
                {t('hero.followUs')}
              </h3>
              <div className="flex justify-center space-x-4 md:space-x-6">
                <a
                  href="https://facebook.com/mrhappy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="Follow us on Facebook"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-2xl flex items-center justify-center hover:border-blue-500/70 hover:bg-blue-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30">
                    <Facebook className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                </a>
                <a
                  href="https://instagram.com/mrhappy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="Follow us on Instagram"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-2xl flex items-center justify-center hover:border-pink-500/70 hover:bg-pink-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30">
                    <Instagram className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-pink-400 transition-colors" />
                  </div>
                </a>
                <a
                  href="https://twitter.com/mrhappy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                  aria-label="Follow us on Twitter"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-800/60 backdrop-blur-md border border-gray-600/50 rounded-2xl flex items-center justify-center hover:border-sky-500/70 hover:bg-sky-500/20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/30">
                    <Twitter className="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-sky-400 transition-colors" />
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          {/* Enhanced and Responsive CTA Button */}
          <div 
            className={`mt-8 md:mt-12 lg:mt-16 transform transition-all duration-1000 ease-out ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'
            }`}
            style={{ 
              transform: `translateY(${scrollY * 0.02}px)`,
              transitionDelay: '600ms'
            }}
          >
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 md:px-10 md:py-4 rounded-full text-base md:text-lg font-light transition-all duration-300 hover:scale-105 md:hover:scale-110 shadow-2xl hover:shadow-red-500/50 drop-shadow-lg">
              {t('hero.cta')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParallaxHero;