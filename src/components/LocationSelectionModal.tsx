import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, CheckCircle, Store, Pizza, Beef, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types';
import { 
  requestUserLocation, 
  findNearestLocation, 
  geocodeAddress, 
  calculateDistance,
  formatDistance,
  estimateDeliveryTime,
  validatePostalCode,
  RESTAURANT_LOCATIONS,
  type Coordinates
} from '../utils/locationUtils';

interface LocationSelectionModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface LocationOption {
  id: 'vegesack' | 'schwanewede';
  name: string;
  area: string;
  address: string;
  restaurants: string[];
  coordinates: { lat: number; lng: number };
  image: string;
  description: string;
  icon: React.ReactNode;
}

const LocationSelectionModal: React.FC<LocationSelectionModalProps> = ({ isOpen, onComplete }) => {
  const { updateProfile } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<'vegesack' | 'schwanewede' | null>(null);
  const [manualAddress, setManualAddress] = useState({
    street: '',
    city: '',
    zipCode: ''
  });
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [error, setError] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const [locationInfo, setLocationInfo] = useState<{
    vegesack: { distance: number; canDeliver: boolean };
    schwanewede: { distance: number; canDeliver: boolean };
  } | null>(null);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    if (isOpen && !userCoordinates) {
      handleAutoDetectLocation();
    }
  }, [isOpen]);

  // Calculate distances when user coordinates change
  useEffect(() => {
    if (userCoordinates) {
      calculateDistancesToRestaurants(userCoordinates);
    }
  }, [userCoordinates]);

  const calculateDistancesToRestaurants = (coords: Coordinates) => {
    const vegesackLocation = RESTAURANT_LOCATIONS.find(loc => loc.id === 'vegesack')!;
    const schwanewedeLocation = RESTAURANT_LOCATIONS.find(loc => loc.id === 'schwanewede')!;

    const vegesackDistance = calculateDistance(coords, vegesackLocation.coordinates);
    const schwanewedeDistance = calculateDistance(coords, schwanewedeLocation.coordinates);

    setLocationInfo({
      vegesack: {
        distance: vegesackDistance,
        canDeliver: vegesackDistance <= vegesackLocation.deliveryRadius
      },
      schwanewede: {
        distance: schwanewedeDistance,
        canDeliver: schwanewedeDistance <= schwanewedeLocation.deliveryRadius
      }
    });

    // Auto-select nearest location that can deliver
    const nearest = findNearestLocation(coords);
    if (nearest && nearest.withinDeliveryRange) {
      setSelectedLocation(nearest.location.id);
      setError('');
    } else if (nearest) {
      // Show which location is closest but out of range
      setSelectedLocation(nearest.location.id);
      setError(`You're ${formatDistance(nearest.distance)} from ${nearest.location.name}. Maximum delivery range is ${nearest.location.deliveryRadius}km. Pickup is available!`);
    }
  };

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    setError('');

    try {
      const coordinates = await requestUserLocation();
      setUserCoordinates(coordinates);
      setIsDetectingLocation(false);
    } catch (err) {
      setIsDetectingLocation(false);
      setError('Unable to detect your location automatically. Please enter your address manually or select a location.');
    }
  };

  const locations: LocationOption[] = [
    {
      id: 'vegesack',
      name: 'Bremen Vegesack',
      area: 'Kaufland Location',
      address: 'Zum Alten Speicher 1, 28759 Bremen',
      restaurants: ['Mr. Happy Döner', 'Mr. Happy Burger'],
      coordinates: { lat: 53.1705, lng: 8.6141 },
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      description: 'Two restaurants in one location - Authentic Döner and Premium Burgers',
      icon: <Store className="w-6 h-6" />
    },
    {
      id: 'schwanewede',
      name: 'Schwanewede',
      area: 'Heidkamp Location',
      address: 'Heidkamp 25, 28790 Schwanewede',
      restaurants: ['MR. Happy Döner & Pizza'],
      coordinates: { lat: 53.2422, lng: 8.6106 },
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      description: 'Delicious Pizza and Turkish specialties',
      icon: <Pizza className="w-6 h-6" />
    }
  ];

  const handleLocationSelect = (locationId: 'vegesack' | 'schwanewede') => {
    setSelectedLocation(locationId);
    setError('');
    setUseManualAddress(false);
  };

  const handleManualAddressToggle = () => {
    setUseManualAddress(!useManualAddress);
    setSelectedLocation(null);
    setError('');
  };

  const handleManualAddressChange = async (field: string, value: string) => {
    setManualAddress(prev => ({ ...prev, [field]: value }));

    // Auto-validate postal code and geocode when complete address is provided
    if (field === 'zipCode' && value.length === 5) {
      const validation = validatePostalCode(value);
      if (validation.isValid && validation.estimatedLocation) {
        setSelectedLocation(validation.estimatedLocation);
      }
    }
  };

  const handleConfirm = async () => {
    if (!selectedLocation && !useManualAddress) {
      setError('Please select a location or enter your address');
      return;
    }

    if (useManualAddress) {
      // Validate manual address
      if (!manualAddress.street || !manualAddress.city || !manualAddress.zipCode) {
        setError('Please fill in all address fields');
        return;
      }

      setIsGeocodingAddress(true);

      try {
        // Geocode the address to get exact coordinates
        const coordinates = await geocodeAddress(manualAddress);
        
        if (coordinates) {
          // Find nearest location and check if within range
          const nearest = findNearestLocation(coordinates);
          
          if (nearest) {
            const canDeliver = nearest.withinDeliveryRange;
            
            const newAddress: Address = {
              id: Date.now().toString(),
              name: 'Home',
              street: manualAddress.street,
              city: manualAddress.city,
              state: 'Bremen',
              zipCode: manualAddress.zipCode,
              isDefault: true
            };

            updateProfile({
              preferredLocation: nearest.location.id,
              deliveryAddress: newAddress,
              addresses: [newAddress],
              locationVerified: true
            });

            if (!canDeliver) {
              setError(`Your address is ${formatDistance(nearest.distance)} from ${nearest.location.name} (max: ${nearest.location.deliveryRadius}km). Pickup is available!`);
              // Still save but user knows it's pickup only
              setTimeout(() => {
                onComplete();
              }, 2000);
            } else {
              onComplete();
            }
          } else {
            setError('Unable to determine nearest location. Please try selecting manually.');
          }
        } else {
          // Fallback to postal code validation
          const validation = validatePostalCode(manualAddress.zipCode);
          
          if (validation.isValid && validation.estimatedLocation) {
            const newAddress: Address = {
              id: Date.now().toString(),
              name: 'Home',
              street: manualAddress.street,
              city: manualAddress.city,
              state: 'Bremen',
              zipCode: manualAddress.zipCode,
              isDefault: true
            };

            updateProfile({
              preferredLocation: validation.estimatedLocation,
              deliveryAddress: newAddress,
              addresses: [newAddress],
              locationVerified: true
            });

            onComplete();
          } else {
            setError(validation.message);
          }
        }
      } catch (err) {
        setError('Unable to validate address. Please try again or select a location manually.');
      } finally {
        setIsGeocodingAddress(false);
      }
    } else if (selectedLocation) {
      // User manually selected a location
      const locationData = locations.find(loc => loc.id === selectedLocation);
      
      const defaultAddress: Address = {
        id: Date.now().toString(),
        name: locationData?.name || '',
        street: locationData?.address.split(',')[0] || '',
        city: locationData?.address.split(',')[1]?.trim().split(' ')[1] || '',
        state: 'Bremen',
        zipCode: locationData?.address.split(',')[1]?.trim().split(' ')[0] || '',
        isDefault: true
      };

      updateProfile({
        preferredLocation: selectedLocation,
        deliveryAddress: defaultAddress,
        addresses: [defaultAddress],
        locationVerified: true
      });

      onComplete();
    }
  };

  const handleSkip = () => {
    // Set a default location if user skips
    updateProfile({
      locationVerified: false
    });
    onComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay - non-dismissible */}
        <div className="fixed inset-0 bg-black/90 transition-opacity" />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 shadow-xl rounded-2xl border border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/20 rounded-full mb-4">
              <MapPin className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Select Your Location
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose the Mr. Happy location nearest to you, or enter your delivery address.
              This helps us provide accurate delivery times and show you the right menu.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Auto-Detection Status */}
          {isDetectingLocation && (
            <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg flex items-center gap-3">
              <Loader className="w-5 h-5 text-blue-400 animate-spin" />
              <div>
                <p className="text-blue-400 font-medium">Detecting your location...</p>
                <p className="text-sm text-gray-400">We'll automatically select the nearest restaurant</p>
              </div>
            </div>
          )}

          {/* Location Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {locations.map((location) => {
              const info = locationInfo?.[location.id];
              const canDeliver = info?.canDeliver ?? true;
              const distance = info?.distance;
              const deliveryRadius = location.id === 'vegesack' ? 5 : 10;

              return (
                <button
                  key={location.id}
                  onClick={() => handleLocationSelect(location.id)}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                    selectedLocation === location.id
                      ? 'border-red-600 bg-red-600/10 shadow-lg shadow-red-600/25'
                      : canDeliver
                      ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      : 'border-gray-800 bg-gray-900/50 opacity-60'
                  }`}
                  disabled={!canDeliver && !!distance}
                >
                  {/* Selection Indicator */}
                  {selectedLocation === location.id && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-8 h-8 text-red-600" />
                    </div>
                  )}

                  {/* Distance Badge */}
                  {distance !== undefined && (
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                      canDeliver 
                        ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                        : 'bg-red-600/20 text-red-400 border border-red-600/50'
                    }`}>
                      {formatDistance(distance)} away
                    </div>
                  )}

                  {/* Location Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-600/20 rounded-lg text-red-600">
                      {location.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{location.name}</h3>
                      <p className="text-sm text-gray-400">{location.area}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-300 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                      {location.address}
                    </p>
                  </div>

                  {/* Delivery Info */}
                  {distance !== undefined && (
                    <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Delivery Range:</span>
                        <span className="text-white font-semibold">Up to {deliveryRadius}km</span>
                      </div>
                      {canDeliver && (
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-gray-400">Est. Delivery:</span>
                          <span className="text-green-400 font-semibold">{estimateDeliveryTime(distance)}</span>
                        </div>
                      )}
                      {!canDeliver && (
                        <div className="mt-2 text-xs text-red-400">
                          Outside delivery range - Pickup available
                        </div>
                      )}
                    </div>
                  )}

                  {/* Restaurants */}
                  <div className="space-y-2 mb-4">
                    {location.restaurants.map((restaurant, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                        <Beef className="w-4 h-4 text-red-600" />
                        <span>{restaurant}</span>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500">{location.description}</p>
                </button>
              );
            })}
          </div>

          {/* Manual Address Section */}
          <div className="border-t border-gray-800 pt-6">
            <button
              onClick={handleManualAddressToggle}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
              <Navigation className="w-5 h-5" />
              <span className="text-sm font-medium">
                {useManualAddress ? 'Choose from locations above' : 'Enter your address manually'}
              </span>
            </button>

            {useManualAddress && (
              <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4">
                <h4 className="text-white font-semibold mb-4">Delivery Address</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={manualAddress.street}
                    onChange={(e) => handleManualAddressChange('street', e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="e.g., Hauptstraße 123"
                    disabled={isGeocodingAddress}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={manualAddress.city}
                      onChange={(e) => handleManualAddressChange('city', e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="e.g., Bremen"
                      disabled={isGeocodingAddress}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={manualAddress.zipCode}
                      onChange={(e) => handleManualAddressChange('zipCode', e.target.value)}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="e.g., 28759"
                      disabled={isGeocodingAddress}
                      maxLength={5}
                    />
                  </div>
                </div>

                {isGeocodingAddress && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Validating address...</span>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  💡 We'll calculate the exact distance and automatically select the nearest Mr. Happy location.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSkip}
              disabled={isGeocodingAddress}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300"
            >
              Skip for Now
            </button>
            <button
              onClick={handleConfirm}
              disabled={(!selectedLocation && !useManualAddress) || isGeocodingAddress}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-600/25 flex items-center justify-center gap-2"
            >
              {isGeocodingAddress ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                'Confirm Location'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectionModal;
