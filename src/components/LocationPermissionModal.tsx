import React, { useState, useEffect } from 'react';
import { MapPin, X, AlertCircle, Navigation, Loader2, CheckCircle2, Info } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { 
  findNearestLocation, 
  formatDistance,
  estimateDeliveryTime,
  type Coordinates
} from '../utils/locationUtils';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationConfirmed: () => void;
  requireLocation?: boolean; // If true, user cannot skip
}

interface DetectedLocationInfo {
  coordinates: Coordinates;
  nearestRestaurant: {
    name: string;
    distance: number;
    canDeliver: boolean;
    estimatedTime: string;
    maxRange: number;
  };
  address?: string;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onLocationConfirmed,
  requireLocation = false
}) => {
  const { setLocation, geocodeLocation, location: savedLocation } = useLocation();
  
  const [step, setStep] = useState<'request' | 'detecting' | 'confirmed' | 'error'>('request');
  const [error, setError] = useState('');
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocationInfo | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      // Check if user already has a saved location
      if (savedLocation) {
        console.log('User has saved location:', savedLocation);
        processLocationCoordinates({
          latitude: savedLocation.latitude,
          longitude: savedLocation.longitude
        });
      } else {
        setStep('request');
        setError('');
        setDetectedLocation(null);
      }
    }
  }, [isOpen, savedLocation]);

  const processLocationCoordinates = async (coordinates: Coordinates) => {
    try {
      console.log('Processing coordinates:', coordinates);
      
      // Find nearest restaurant
      const nearest = findNearestLocation(coordinates);
      
      if (!nearest) {
        throw new Error('Could not find nearest restaurant location');
      }

      console.log('Nearest restaurant found:', {
        name: nearest.location.name,
        distance: nearest.distance,
        canDeliver: nearest.withinDeliveryRange
      });

      // Save location to context
      setLocation({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy: 100,
        timestamp: Date.now()
      });

      // Geocode to get address (non-blocking)
      geocodeLocation(coordinates.latitude, coordinates.longitude).catch(err => {
        console.warn('Geocoding failed, but location is still valid:', err);
      });

      // Set detected location info
      const locationInfo: DetectedLocationInfo = {
        coordinates,
        nearestRestaurant: {
          name: nearest.location.name,
          distance: nearest.distance,
          canDeliver: nearest.withinDeliveryRange,
          estimatedTime: estimateDeliveryTime(nearest.distance),
          maxRange: nearest.location.deliveryRadius
        }
      };

      setDetectedLocation(locationInfo);
      setStep('confirmed');
    } catch (err: any) {
      console.error('Error processing location:', err);
      throw err;
    }
  };

  const handleRequestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please enter your address manually.');
      setStep('error');
      return;
    }

    setStep('detecting');
    setError('');

    const options: PositionOptions = {
      enableHighAccuracy: true, // Use GPS, not network-based
      timeout: 15000, // Wait up to 15 seconds
      maximumAge: 0 // Don't use cached position
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      console.log('GPS position obtained:', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });

      const coordinates: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      await processLocationCoordinates(coordinates);
    } catch (err: any) {
      console.error('Location detection error:', err);
      
      let errorMessage = 'Unable to detect your location. ';
      
      if (err.code === 1) {
        errorMessage += 'Location access was denied. Please enable location permissions in your browser settings.';
      } else if (err.code === 2) {
        errorMessage += 'Location information is unavailable. Please check your device settings.';
      } else if (err.code === 3) {
        errorMessage += 'Location request timed out. Please try again.';
      } else {
        errorMessage += 'Please try again or enter your address manually.';
      }
      
      setError(errorMessage);
      setStep('error');
    }
  };

  const handleConfirm = () => {
    if (detectedLocation) {
      onLocationConfirmed();
      onClose();
    }
  };

  const handleSkip = () => {
    if (!requireLocation) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black/90 transition-opacity" 
          onClick={requireLocation ? undefined : onClose} 
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-lg p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 shadow-xl rounded-2xl border border-gray-800 relative">
          {/* Close button (only if not required) */}
          {!requireLocation && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Step: Request Location */}
          {step === 'request' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-full mb-6">
                <MapPin className="w-10 h-10 text-white animate-pulse" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-3">
                Enable Location Access
              </h2>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                We need your location to verify delivery availability and calculate accurate delivery times.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Check Delivery Availability</p>
                    <p className="text-sm text-gray-400">See if you're within our delivery range</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Calculate Real Distance</p>
                    <p className="text-sm text-gray-400">Get accurate delivery time estimates</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Find Nearest Restaurant</p>
                    <p className="text-sm text-gray-400">Show menu from closest Mr. Happy location</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRequestLocation}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-red-600/25 flex items-center justify-center gap-3 mb-3"
              >
                <Navigation className="w-6 h-6" />
                <span>Allow Location Access</span>
              </button>

              {!requireLocation && (
                <button
                  onClick={handleSkip}
                  className="w-full px-6 py-3 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                  I'll enter my address manually
                </button>
              )}

              <div className="mt-6 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300">
                  Your location is only used for delivery calculations and is never shared with third parties.
                </p>
              </div>
            </div>
          )}

          {/* Step: Detecting */}
          {step === 'detecting' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600/20 rounded-full mb-6">
                <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-3">
                Detecting Your Location...
              </h2>
              
              <p className="text-gray-400 mb-6">
                This may take a few seconds. Please allow location access when prompted.
              </p>

              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {/* Step: Confirmed */}
          {step === 'confirmed' && detectedLocation && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600/20 rounded-full mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                Location Confirmed!
              </h2>
              
              <p className="text-gray-400 mb-6">
                We found the nearest Mr. Happy location to you
              </p>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 mb-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-600/20 rounded-lg flex-shrink-0">
                    <MapPin className="w-8 h-8 text-red-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {detectedLocation.nearestRestaurant.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Nearest Mr. Happy restaurant
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Distance</p>
                        <p className="text-2xl font-bold text-white">
                          {formatDistance(detectedLocation.nearestRestaurant.distance)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          From your location
                        </p>
                      </div>
                      
                      <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Delivery Range</p>
                        <p className="text-2xl font-bold text-white">
                          {detectedLocation.nearestRestaurant.maxRange}km
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Maximum range
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${
                      detectedLocation.nearestRestaurant.canDeliver
                        ? 'bg-green-900/20 border-green-600/50'
                        : 'bg-yellow-900/20 border-yellow-600/50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {detectedLocation.nearestRestaurant.canDeliver ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span className="text-green-400 font-bold">Delivery Available!</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                            <span className="text-yellow-400 font-bold">Pickup Only</span>
                          </>
                        )}
                      </div>
                      
                      {detectedLocation.nearestRestaurant.canDeliver ? (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-300">Estimated delivery:</span>
                            <span className="text-white font-semibold">
                              {detectedLocation.nearestRestaurant.estimatedTime}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-300">Delivery fee:</span>
                            <span className="text-white font-semibold">€2.00</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-yellow-300">
                          You're {formatDistance(detectedLocation.nearestRestaurant.distance)} away 
                          (max: {detectedLocation.nearestRestaurant.maxRange}km). Pickup is available at this location!
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-600/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>Continue to Browse Menu</span>
              </button>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-600/20 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-3">
                Location Access Required
              </h2>
              
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-red-400 text-sm">
                  {error}
                </p>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-5 mb-6 text-left border border-gray-700">
                <p className="text-white font-bold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  How to enable location:
                </p>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-red-600 text-white rounded-full font-bold text-xs flex-shrink-0">1</span>
                    <span>Click the lock icon 🔒 or info icon ⓘ in your browser's address bar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-red-600 text-white rounded-full font-bold text-xs flex-shrink-0">2</span>
                    <span>Find "Location" or "Permissions" section</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-red-600 text-white rounded-full font-bold text-xs flex-shrink-0">3</span>
                    <span>Change from "Block" to "Allow"</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-red-600 text-white rounded-full font-bold text-xs flex-shrink-0">4</span>
                    <span>Click "Try Again" below</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRequestLocation}
                  className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  <span>Try Again</span>
                </button>

                {!requireLocation && (
                  <button
                    onClick={handleSkip}
                    className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    Continue Without Location
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
