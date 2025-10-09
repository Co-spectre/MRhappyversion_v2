// Bremen address geocoding and delivery validation
// This system recognizes Bremen addresses and validates delivery without GPS

export interface BremenAddress {
  street: string;
  city: string;
  zipCode: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  isValid: boolean;
  isInBremen: boolean;
}

// Bremen city center coordinates (approximately)
const BREMEN_CENTER = {
  latitude: 53.0793,
  longitude: 8.8017
};

// Bremen postal code ranges and their approximate coordinates
const BREMEN_POSTAL_CODES: { [key: string]: { lat: number; lng: number; area: string } } = {
  // Bremen city center and surrounding areas
  '28195': { lat: 53.0793, lng: 8.8017, area: 'Bremen Mitte' },
  '28203': { lat: 53.0836, lng: 8.7987, area: 'Bremen Mitte' },
  '28209': { lat: 53.0756, lng: 8.8059, area: 'Bremen Mitte' },
  
  // Bremen districts
  '28199': { lat: 53.0650, lng: 8.8350, area: 'Neustadt' },
  '28205': { lat: 53.0920, lng: 8.8200, area: 'Schwachhausen' },
  '28211': { lat: 53.0580, lng: 8.8480, area: 'Obervieland' },
  '28213': { lat: 53.0520, lng: 8.8650, area: 'Obervieland' },
  '28215': { lat: 53.0450, lng: 8.8800, area: 'Huchting' },
  '28217': { lat: 53.0380, lng: 8.8950, area: 'Woltmershausen' },
  '28219': { lat: 53.0680, lng: 8.7850, area: 'Walle' },
  '28237': { lat: 53.0850, lng: 8.7650, area: 'Gröpelingen' },
  '28239': { lat: 53.0920, lng: 8.7450, area: 'Oslebshausen' },
  '28259': { lat: 53.1150, lng: 8.8450, area: 'Horn-Lehe' },
  '28277': { lat: 53.1250, lng: 8.8650, area: 'Borgfeld' },
  '28279': { lat: 53.1320, lng: 8.8850, area: 'Lilienthal' },
  '28307': { lat: 53.1450, lng: 8.7850, area: 'Burglesum' },
  '28309': { lat: 53.1520, lng: 8.7650, area: 'Leuchtenburg' },
  '28327': { lat: 53.1080, lng: 8.7200, area: 'Blockdiek' },
  '28329': { lat: 53.1150, lng: 8.6950, area: 'Tenever' },
  '28355': { lat: 53.0280, lng: 8.7850, area: 'Seehausen' },
  '28357': { lat: 53.0150, lng: 8.8050, area: 'Strom' },
  '28359': { lat: 53.0050, lng: 8.8250, area: 'Habenhausen' },
  '28717': { lat: 53.1680, lng: 8.8150, area: 'Bremen-Nord' },
  '28719': { lat: 53.1750, lng: 8.7950, area: 'Vegesack' },
  '28755': { lat: 53.1850, lng: 8.7750, area: 'Blumenthal' },
  '28757': { lat: 53.1920, lng: 8.7550, area: 'Rönnebeck' },
  '28759': { lat: 53.2050, lng: 8.7350, area: 'Farge' }
};

// Common Bremen street name patterns for validation
const BREMEN_STREET_PATTERNS = [
  'straße', 'str.', 'str', 'weg', 'platz', 'allee', 'gasse', 'ring', 'damm', 'chaussee',
  'brücke', 'ufer', 'deich', 'wall', 'berg', 'feld', 'hof', 'park', 'markt', 'kirchhof'
];

/**
 * Geocodes a Bremen address and returns coordinates
 */
export function geocodeBremenAddress(address: BremenAddress): GeocodeResult {
  const { street, city, zipCode } = address;
  
  // Basic validation
  if (!street || !city || !zipCode) {
    return {
      latitude: 0,
      longitude: 0,
      isValid: false,
      isInBremen: false
    };
  }

  // Check if its a Bremen postal code
  const postalInfo = BREMEN_POSTAL_CODES[zipCode];
  if (!postalInfo) {
    // Check if city name suggests Bremen
    const cityLower = city.toLowerCase();
    const isBremenCity = cityLower.includes('bremen') || cityLower.includes('bremerhaven');
    
    if (!isBremenCity) {
      return {
        latitude: 0,
        longitude: 0,
        isValid: false,
        isInBremen: false
      };
    }
    
    // If city suggests Bremen but postal code is unknown, use city center
    return {
      latitude: BREMEN_CENTER.latitude,
      longitude: BREMEN_CENTER.longitude,
      isValid: true,
      isInBremen: true
    };
  }

  // For known Bremen postal codes, use the coordinates
  return {
    latitude: postalInfo.lat,
    longitude: postalInfo.lng,
    isValid: true,
    isInBremen: true
  };
}

/**
 * Checks if an address is within delivery range of restaurants
 */
export function checkAddressDeliveryEligibility(
  address: BremenAddress,
  restaurantCoordinates: { latitude: number; longitude: number },
  deliveryRadius: number
): { canDeliver: boolean; distance: number; message: string } {
  const geocoded = geocodeBremenAddress(address);
  
  if (!geocoded.isValid) {
    return {
      canDeliver: false,
      distance: 0,
      message: 'Invalid address. Please check your street, city, and postal code.'
    };
  }

  if (!geocoded.isInBremen) {
    return {
      canDeliver: false,
      distance: 0,
      message: 'Sorry, we only deliver within Bremen.'
    };
  }

  // Calculate distance using haversine formula
  const distance = haversineDistance(
    geocoded.latitude,
    geocoded.longitude,
    restaurantCoordinates.latitude,
    restaurantCoordinates.longitude
  );

  const canDeliver = distance <= deliveryRadius;

  return {
    canDeliver,
    distance,
    message: canDeliver
      ? `✅ Delivery available! Distance: ${distance.toFixed(1)}km`
      : `🚫 Outside ${deliveryRadius}km delivery zone (${distance.toFixed(1)}km away)`
  };
}

// Haversine distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
