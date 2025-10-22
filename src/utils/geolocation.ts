// Google Geolocation and Reverse Geocoding Utility
// This utility gets the user's exact location and converts it to a complete address

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AddressComponents {
  street: string;
  city: string;
  zipCode: string;
  country: string;
  fullAddress: string;
}

export interface GeolocationResult {
  success: boolean;
  coordinates?: LocationCoordinates;
  address?: AddressComponents;
  error?: string;
}

/**
 * Gets the user's current location using HTML5 Geolocation API
 */
export function getCurrentLocation(): Promise<LocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Your browser does not support location detection. Please enter your address manually.'));
      return;
    }

    // Try high accuracy first
    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 30000
    };

    // Fallback to low accuracy
    const lowAccuracyOptions = {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 300000 // 5 minutes
    };

    const attemptLocation = (options: PositionOptions, isRetry: boolean = false) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access blocked. Please enable location services and refresh the page.';
              break;
            case error.POSITION_UNAVAILABLE:
              if (!isRetry) {
                // Try again with lower accuracy
                attemptLocation(lowAccuracyOptions, true);
                return;
              }
              errorMessage = 'Location unavailable. Please check if location services are enabled on your device and try entering your address manually.';
              break;
            case error.TIMEOUT:
              if (!isRetry) {
                // Try again with lower accuracy
                attemptLocation(lowAccuracyOptions, true);
                return;
              }
              errorMessage = 'Location detection timed out. Please try again or enter your address manually.';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    };

    // Start with high accuracy
    attemptLocation(highAccuracyOptions);
  });
}

/**
 * Converts coordinates to address using OpenStreetMap Nominatim (free alternative to Google)
 * This is more reliable and doesn't require API keys
 */
export async function reverseGeocode(coordinates: LocationCoordinates): Promise<AddressComponents> {
  try {
    const { latitude, longitude } = coordinates;
    
    // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
      {
        headers: {
          'User-Agent': 'MRhappy-Restaurant-App'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      throw new Error('No address found for these coordinates');
    }

    const addr = data.address;
    
    // Extract address components
    const street = [
      addr.house_number,
      addr.road || addr.street || addr.pedestrian || addr.path
    ].filter(Boolean).join(' ');

    const city = addr.city || addr.town || addr.village || addr.municipality || 'Bremen';
    const zipCode = addr.postcode || '';
    const country = addr.country || 'Germany';
    const fullAddress = data.display_name || '';

    return {
      street: street || '',
      city,
      zipCode,
      country,
      fullAddress
    };

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Unable to convert location to address. Please enter your address manually.');
  }
}

/**
 * Main function to get user's location and convert it to an address
 */
export async function getLocationAndAddress(): Promise<GeolocationResult> {
  try {
    console.log('🌍 Getting user location...');
    
    // Step 1: Get current coordinates
    const coordinates = await getCurrentLocation();
    console.log('📍 Location found:', coordinates);
    
    // Step 2: Convert coordinates to address
    const address = await reverseGeocode(coordinates);
    console.log('🏠 Address resolved:', address);
    
    return {
      success: true,
      coordinates,
      address
    };

  } catch (error) {
    console.error('Geolocation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Validates if the detected address is in Bremen area
 */
export function isBremenArea(address: AddressComponents): boolean {
  const city = address.city.toLowerCase();
  const zipCode = address.zipCode;
  
  // Check if city name contains Bremen
  if (city.includes('bremen')) {
    return true;
  }
  
  // Check Bremen postal codes
  const bremenZipCodes = [
    '28195', '28203', '28209', '28199', '28205', '28211', '28213', '28215',
    '28217', '28219', '28237', '28239', '28259', '28277', '28279', '28307',
    '28309', '28327', '28329', '28355', '28357', '28359', '28717', '28719',
    '28755', '28757', '28759'
  ];
  
  return bremenZipCodes.includes(zipCode);
}
