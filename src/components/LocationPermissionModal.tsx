import React, { useState, useEffect } from 'react';
import { MapPin, X, AlertCircle, Navigation, Clock } from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationGranted: (location: GeolocationPosition) => void;
  onLocationDenied: () => void;
}

interface LocationState {
  loading: boolean;
  error: string | null;
  position: GeolocationPosition | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  onLocationGranted,
  onLocationDenied
}) => {
  const [locationState, setLocationState] = useState<LocationState>({
    loading: false,
    error: null,
    position: null,
    permissionStatus: 'prompt'
  });

  useEffect(() => {
    if (isOpen) {
      checkLocationSupport();
    }
  }, [isOpen]);

  const checkLocationSupport = () => {
    if (!navigator.geolocation) {
      setLocationState(prev => ({
        ...prev,
        permissionStatus: 'unsupported',
        error: 'Geolocation is not supported by this browser'
      }));
      return;
    }

    // Check current permission status
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then(result => {
          setLocationState(prev => ({
            ...prev,
            permissionStatus: result.state as 'granted' | 'denied' | 'prompt'
          }));
        })
        .catch(() => {
          // Fallback if permissions API is not supported
          setLocationState(prev => ({ ...prev, permissionStatus: 'prompt' }));
        });
    }
  };

  const requestLocation = () => {
    setLocationState(prev => ({ ...prev, loading: true, error: null }));

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache for 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState(prev => ({
          ...prev,
          loading: false,
          position,
          permissionStatus: 'granted'
        }));
        onLocationGranted(position);
        onClose();
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            setLocationState(prev => ({ ...prev, permissionStatus: 'denied' }));
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setLocationState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage
        }));

        if (error.code === error.PERMISSION_DENIED) {
          onLocationDenied();
        }
      },
      options
    );
  };

  const handleManualEntry = () => {
    onLocationDenied();
    onClose();
  };

  const handleCheckoutLocationRequest = () => {
    if (locationState.permissionStatus === 'prompt') {
      requestLocation();
    } else if (locationState.permissionStatus === 'denied') {
      onLocationDenied();
    } else if (locationState.permissionStatus === 'granted') {
      onLocationGranted(locationState.position!);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-200 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <MapPin size={28} />
            <div>
              <h2 className="text-xl font-bold">Enable Location</h2>
              <p className="text-red-100 text-sm">For better delivery experience</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {locationState.permissionStatus === 'unsupported' ? (
            <div className="text-center">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Location Not Supported
              </h3>
              <p className="text-gray-600 mb-4">
                Your browser doesn't support location services. You can manually enter your address during checkout.
              </p>
              <button
                onClick={handleManualEntry}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Continue Without Location
              </button>
            </div>
          ) : (
            <>
              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Why we need your location:
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <Navigation size={16} className="text-red-500" />
                    <span>Find nearby restaurants</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Clock size={16} className="text-red-500" />
                    <span>Accurate delivery time estimates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <MapPin size={16} className="text-red-500" />
                    <span>Pre-fill delivery address</span>
                  </li>
                </ul>
              </div>

              {/* Error Display */}
              {locationState.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <span className="text-red-700 text-sm">{locationState.error}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckoutLocationRequest}
                  disabled={locationState.loading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {locationState.loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={20} />
                      <span>Allow Location Access</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleManualEntry}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Enter Address Manually
                </button>
              </div>

              {/* Privacy Note */}
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>
                  Your location is only used to improve your delivery experience. 
                  We don't store or share your location data.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPermissionModal;
