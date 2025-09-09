import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    formatted?: string;
  };
}

interface LocationContextType {
  location: LocationData | null;
  isLocationEnabled: boolean;
  isLocationLoading: boolean;
  locationError: string | null;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
  requestLocation: () => Promise<void>;
  setLocation: (location: LocationData) => void;
  clearLocation: () => void;
  geocodeLocation: (lat: number, lng: number) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Check if location is enabled
  const isLocationEnabled = location !== null;

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        // Check if location is not too old (1 hour)
        if (Date.now() - parsedLocation.timestamp < 3600000) {
          setLocationState(parsedLocation);
        } else {
          localStorage.removeItem('userLocation');
        }
      } catch (error) {
        console.error('Error parsing saved location:', error);
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  const setLocation = (newLocation: LocationData) => {
    setLocationState(newLocation);
    // Save to localStorage
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
    setLocationError(null);
  };

  const clearLocation = () => {
    setLocationState(null);
    localStorage.removeItem('userLocation');
    setLocationError(null);
  };

  const requestLocation = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'Geolocation is not supported by this browser';
        setLocationError(error);
        reject(new Error(error));
        return;
      }

      setIsLocationLoading(true);
      setLocationError(null);

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache for 1 minute
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };

          setLocation(locationData);
          setIsLocationLoading(false);

          // Try to geocode the location
          try {
            await geocodeLocation(locationData.latitude, locationData.longitude);
          } catch (geocodeError) {
            console.warn('Geocoding failed:', geocodeError);
            // Still resolve with basic location data
          }

          resolve();
        },
        (error) => {
          setIsLocationLoading(false);
          
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  const geocodeLocation = async (lat: number, lng: number): Promise<void> => {
    try {
      // Using OpenStreetMap Nominatim API for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'MRhappy-Restaurant-App'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      if (data && data.address) {
        const address = {
          street: data.address.road || data.address.house_number 
            ? `${data.address.house_number || ''} ${data.address.road || ''}`.trim()
            : undefined,
          city: data.address.city || data.address.town || data.address.village || data.address.municipality,
          postalCode: data.address.postcode,
          country: data.address.country,
          formatted: data.display_name
        };

        // Update location with address information
        setLocationState(prev => {
          if (prev) {
            const updatedLocation = { ...prev, address };
            localStorage.setItem('userLocation', JSON.stringify(updatedLocation));
            return updatedLocation;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Don't throw error, just log it - location without address is still useful
    }
  };

  const value: LocationContextType = {
    location,
    isLocationEnabled,
    isLocationLoading,
    locationError,
    showLocationModal,
    setShowLocationModal,
    requestLocation,
    setLocation,
    clearLocation,
    geocodeLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
