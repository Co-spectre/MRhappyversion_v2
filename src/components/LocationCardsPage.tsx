import React, { useState } from 'react';
import { MapPin, Clock, ChevronDown, ChevronUp, ExternalLink, Phone, Navigation } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone: string;
  hours: {
    [key: string]: string;
  };
  specialHours?: string;
  image: string;
  description: string;
  features: string[];
}

interface LocationCardsPageProps {
  onRestaurantSelect?: (restaurantId: string) => void;
}

const LocationCardsPage: React.FC<LocationCardsPageProps> = ({ onRestaurantSelect }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const locations: Location[] = [
      {
        id: 'doner-vegesack',
        name: 'Mr. Happy Döner',
        address: 'Bremen Vegesack Kaufland - Zum Alten Speicher 1 · 28759 Bremen',
        coordinates: { lat: 53.1678, lng: 8.6119 },
        phone: '+49 421 12345678',
        hours: {
          'Monday': '8:00 - 20:00',
          'Tuesday': '8:00 - 20:00',
          'Wednesday': '8:00 - 20:00',
          'Thursday': '8:00 - 20:00',
          'Friday': '8:00 - 20:00',
          'Saturday': '8:00 - 20:00',
          'Sunday': 'Closed'
        },
        image: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=800',
        description: 'Authentic Turkish döner and Mediterranean specialties in the heart of Bremen Vegesack.',
        features: ['Halal Certified', 'Fresh Daily Preparation', 'Vegetarian Options', 'Takeaway & Delivery']
      },
    {
      id: 'burger-vegesack',
      name: 'Mr.Happy Burger',
      address: 'Bremen Vegesack Kaufland - Zum Alten Speicher 1 · 28759 Bremen',
      coordinates: { lat: 53.1678, lng: 8.6119 },
      phone: '+49 421 87654321',
      hours: {
        'Monday': '8:00 - 20:00',
        'Tuesday': '8:00 - 20:00',
        'Wednesday': '8:00 - 20:00',
        'Thursday': '8:00 - 20:00',
        'Friday': '8:00 - 20:00',
        'Saturday': '8:00 - 20:00',
        'Sunday': 'Closed'
      },
      image: 'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Premium American-style burgers made with locally sourced ingredients and artisan buns.',
      features: ['Premium Beef', 'Artisan Buns', 'Hand-Cut Fries', 'Craft Sauces']
    },
    {
      id: 'doner-pizza-schwanewede',
  name: 'Doner&Pizza',
      address: 'Bremen - Heidkamp 25 · 28790 Schwanewede',
      coordinates: { lat: 53.2089, lng: 8.5614 },
      phone: '+49 421 11223344',
      hours: {
        'Monday': '11:00 - 22:00',
        'Tuesday': '11:00 - 22:00',
        'Wednesday': '11:00 - 22:00',
        'Thursday': '11:00 - 22:00',
        'Friday': '11:00 - 22:00',
        'Saturday': '11:00 - 22:00',
        'Sunday': '11:00 - 22:00'
      },
      specialHours: 'Open every day of the week',
      image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Combining the best of Turkish döner with authentic Italian pizza in Schwanewede.',
      features: ['Döner & Pizza', 'Wood-Fired Oven', 'Family Recipes', 'Extended Hours']
    }
  ];

  // Map location IDs to restaurant types for food menu navigation
  const getRestaurantType = (locationId: string): string => {
    switch (locationId) {
      case 'doner-vegesack':
        return 'doner';
      case 'burger-vegesack':
        return 'burger';
      case 'doner-pizza-schwanewede':
        return 'restaurant';
      default:
        return 'doner';
    }
  };

  const handleOrderNow = (locationId: string) => {
    if (onRestaurantSelect) {
      const restaurantType = getRestaurantType(locationId);
      onRestaurantSelect(restaurantType);
    }
  };

  const openInMaps = (address: string, coordinates: { lat: number; lng: number }) => {
    const encodedAddress = encodeURIComponent(address);
    
    // Check if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Try to open in native maps app
      window.open(`geo:${coordinates.lat},${coordinates.lng}?q=${encodedAddress}`, '_blank');
    } else {
      // Open in Google Maps web
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const toggleExpand = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const getCurrentDayHours = (hours: { [key: string]: string }) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return hours[today] || 'Closed';
  };

  const isOpen = (hours: { [key: string]: string }) => {
    const currentHours = getCurrentDayHours(hours);
    if (currentHours === 'Closed') return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openTime, closeTime] = currentHours.split(' - ');
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    return currentTime >= openMinutes && currentTime <= closeMinutes;
  };

  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      {/* Hero Section - Compact */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Our <span className="text-red-500">Locations</span>
          </h1>
          <p className="text-lg text-gray-300">
            Visit us at any of our convenient locations across Bremen
          </p>
        </div>
      </section>

      {/* Location Cards - Compact Grid */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <div 
                key={location.id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/20"
              >
                {/* Card Header - Compact */}
                <div className="relative h-32">
                  <img 
                    src={location.image} 
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                    isOpen(location.hours) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {isOpen(location.hours) ? 'OPEN' : 'CLOSED'}
                  </div>

                  {/* Location Name */}
                  <div className="absolute bottom-2 left-3 right-3">
                    <h3 className="text-lg font-bold text-white mb-1">{location.name}</h3>
                  </div>
                </div>

                {/* Card Content - Compact */}
                <div className="p-4">
                  {/* Current Hours */}
                  <div className="flex items-center space-x-2 mb-3 text-sm">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="text-gray-300">{getCurrentDayHours(location.hours)}</span>
                  </div>

                  {/* Address - Clickable */}
                  <div 
                    className="flex items-start space-x-2 mb-3 cursor-pointer group"
                    onClick={() => openInMaps(location.address, location.coordinates)}
                  >
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-300 group-hover:text-white transition-colors text-sm leading-relaxed">
                        {location.address}
                      </p>
                      <div className="flex items-center space-x-1 text-red-400 text-xs mt-1 group-hover:text-red-300">
                        <Navigation className="w-3 h-3" />
                        <span>Open in Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Phone className="w-4 h-4 text-red-500" />
                    <a 
                      href={`tel:${location.phone}`}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {location.phone}
                    </a>
                  </div>

                  {/* Expand/Collapse Button */}
                  <button
                    onClick={() => toggleExpand(location.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors text-sm"
                  >
                    <span>{expandedCard === location.id ? 'Show Less' : 'More Details'}</span>
                    {expandedCard === location.id ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>

                  {/* Expanded Content */}
                  {expandedCard === location.id && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
                      {/* Description */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">About</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">{location.description}</p>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Features</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {location.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-gray-300 text-xs">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Full Opening Hours */}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Opening Hours</h4>
                        <div className="space-y-1">
                          {Object.entries(location.hours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between items-center text-xs">
                              <span className="text-gray-400">{day}</span>
                              <span className={`${
                                hours === 'Closed' ? 'text-red-400' : 'text-gray-300'
                              }`}>
                                {hours}
                              </span>
                            </div>
                          ))}
                        </div>
                        {location.specialHours && (
                          <p className="text-green-400 text-xs mt-2 italic">{location.specialHours}</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => openInMaps(location.address, location.coordinates)}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-1 text-sm"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Directions</span>
                        </button>
                        <button 
                          onClick={() => handleOrderNow(location.id)}
                          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm"
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocationCardsPage;
