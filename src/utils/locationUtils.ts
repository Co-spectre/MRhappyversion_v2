/**
 * Location and Distance Calculation Utilities
 * Handles GPS-based distance calculations and delivery radius validation
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RestaurantLocation {
  id: 'vegesack' | 'schwanewede';
  name: string;
  coordinates: Coordinates;
  deliveryRadius: number; // in kilometers
  restaurantTypes: string[];
}

// Restaurant locations with exact coordinates
export const RESTAURANT_LOCATIONS: RestaurantLocation[] = [
  {
    id: 'vegesack',
    name: 'Bremen Vegesack (Kaufland)',
    coordinates: {
      latitude: 53.1705,  // Bremen Vegesack - Zum Alten Speicher 1
      longitude: 8.6141
    },
    deliveryRadius: 5, // 5km radius
    restaurantTypes: ['doner', 'burger']
  },
  {
    id: 'schwanewede',
    name: 'Schwanewede (Heidkamp)',
    coordinates: {
      latitude: 53.2422,  // Schwanewede - Heidkamp 25
      longitude: 8.6106
    },
    deliveryRadius: 10, // 10km radius
    restaurantTypes: ['restaurant'] // doner-pizza
  }
];

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  
  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLng = toRadians(coord2.longitude - coord1.longitude);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find the nearest restaurant location to given coordinates
 */
export function findNearestLocation(userCoordinates: Coordinates): {
  location: RestaurantLocation;
  distance: number;
  withinDeliveryRange: boolean;
} | null {
  let nearestLocation: RestaurantLocation | null = null;
  let minDistance = Infinity;

  for (const location of RESTAURANT_LOCATIONS) {
    const distance = calculateDistance(userCoordinates, location.coordinates);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestLocation = location;
    }
  }

  if (!nearestLocation) return null;

  return {
    location: nearestLocation,
    distance: minDistance,
    withinDeliveryRange: minDistance <= nearestLocation.deliveryRadius
  };
}

/**
 * Check if a location is within delivery range of a specific restaurant
 */
export function isWithinDeliveryRange(
  userCoordinates: Coordinates,
  restaurantLocation: RestaurantLocation
): { withinRange: boolean; distance: number } {
  const distance = calculateDistance(userCoordinates, restaurantLocation.coordinates);
  
  return {
    withinRange: distance <= restaurantLocation.deliveryRadius,
    distance
  };
}

/**
 * Get all locations that can deliver to the user
 */
export function getAvailableLocations(userCoordinates: Coordinates): {
  location: RestaurantLocation;
  distance: number;
}[] {
  const availableLocations: { location: RestaurantLocation; distance: number }[] = [];

  for (const location of RESTAURANT_LOCATIONS) {
    const distance = calculateDistance(userCoordinates, location.coordinates);
    
    if (distance <= location.deliveryRadius) {
      availableLocations.push({
        location,
        distance
      });
    }
  }

  // Sort by distance (closest first)
  return availableLocations.sort((a, b) => a.distance - b.distance);
}

/**
 * Validate postal code and estimate location
 * Returns best guess location based on postal code
 */
export function validatePostalCode(postalCode: string): {
  isValid: boolean;
  estimatedLocation?: 'vegesack' | 'schwanewede';
  message: string;
} {
  // Remove spaces and validate format
  const cleanCode = postalCode.replace(/\s/g, '');
  
  if (!/^\d{5}$/.test(cleanCode)) {
    return {
      isValid: false,
      message: 'Invalid postal code format. Please use 5 digits (e.g., 28759).'
    };
  }

  // Vegesack area postal codes
  const vegesackCodes = ['28757', '28759', '28755', '28777'];
  // Schwanewede area postal codes
  const schwanewedeCodes = ['28790', '28791'];
  // Other Bremen codes that might be close
  const bremenCodes = ['28195', '28197', '28199', '28201', '28203', '28205', '28207', '28209', '28211', '28213', '28215', '28217', '28219', '28239', '28249', '28259', '28277', '28279', '28307', '28309', '28325', '28327', '28329', '28355', '28357', '28359'];

  if (vegesackCodes.includes(cleanCode)) {
    return {
      isValid: true,
      estimatedLocation: 'vegesack',
      message: 'This address is in the Vegesack delivery area.'
    };
  }

  if (schwanewedeCodes.includes(cleanCode)) {
    return {
      isValid: true,
      estimatedLocation: 'schwanewede',
      message: 'This address is in the Schwanewede delivery area.'
    };
  }

  if (bremenCodes.includes(cleanCode)) {
    return {
      isValid: true,
      estimatedLocation: 'vegesack',
      message: 'This Bremen address may be within delivery range. We\'ll verify the exact distance.'
    };
  }

  return {
    isValid: false,
    message: 'This postal code appears to be outside our delivery area. Pickup is still available!'
  };
}

/**
 * Request user's GPS location
 */
export function requestUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * Get delivery time estimate based on distance
 */
export function estimateDeliveryTime(distanceKm: number): string {
  // Base preparation time: 15-20 minutes
  // Delivery time: ~3 minutes per km
  const prepTime = 15;
  const deliveryTime = Math.ceil(distanceKm * 3);
  const minTime = prepTime + deliveryTime;
  const maxTime = minTime + 10; // Add 10 minute buffer
  
  return `${minTime}-${maxTime} min`;
}

/**
 * Geocode address to coordinates using Nominatim API
 */
export async function geocodeAddress(address: {
  street: string;
  city: string;
  zipCode: string;
}): Promise<Coordinates | null> {
  try {
    const query = `${address.street}, ${address.zipCode} ${address.city}, Germany`;
    const encodedQuery = encodeURIComponent(query);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
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
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
