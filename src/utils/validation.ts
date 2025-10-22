// Comprehensive validation utilities for checkout forms

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validate German phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Check for German phone format (+49 or 0)
  const germanPhoneRegex = /^(\+49|0049|0)[1-9]\d{1,14}$/;
  
  if (!germanPhoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid German phone number (e.g., +49 421 123456 or 0421 123456)' };
  }

  if (cleanPhone.length < 10) {
    return { isValid: false, error: 'Phone number is too short' };
  }

  if (cleanPhone.length > 16) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  return { isValid: true };
}

/**
 * Validate name (first or last)
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: `${fieldName} must be less than 50 characters` };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-ZäöüßÄÖÜ\s\-']+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true };
}

/**
 * Validate street address
 */
export function validateStreet(street: string): ValidationResult {
  if (!street || street.trim() === '') {
    return { isValid: false, error: 'Street address is required' };
  }

  if (street.trim().length < 5) {
    return { isValid: false, error: 'Please enter a complete street address' };
  }

  if (street.trim().length > 100) {
    return { isValid: false, error: 'Street address is too long' };
  }

  return { isValid: true };
}

/**
 * Validate city name
 */
export function validateCity(city: string): ValidationResult {
  if (!city || city.trim() === '') {
    return { isValid: false, error: 'City is required' };
  }

  if (city.trim().length < 2) {
    return { isValid: false, error: 'Please enter a valid city name' };
  }

  if (city.trim().length > 50) {
    return { isValid: false, error: 'City name is too long' };
  }

  // Check for valid characters
  const cityRegex = /^[a-zA-ZäöüßÄÖÜ\s\-]+$/;
  if (!cityRegex.test(city)) {
    return { isValid: false, error: 'City name contains invalid characters' };
  }

  return { isValid: true };
}

/**
 * Validate German postal code (PLZ)
 */
export function validateZipCode(zipCode: string): ValidationResult {
  if (!zipCode || zipCode.trim() === '') {
    return { isValid: false, error: 'Postal code is required' };
  }

  // German postal codes are 5 digits
  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(zipCode)) {
    return { isValid: false, error: 'Please enter a valid 5-digit postal code' };
  }

  return { isValid: true };
}

/**
 * Validate Bremen postal code specifically
 */
export function validateBremenZipCode(zipCode: string): ValidationResult {
  const basicValidation = validateZipCode(zipCode);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Bremen postal codes start with 28
  if (!zipCode.startsWith('28')) {
    return { 
      isValid: false, 
      error: 'We only deliver within Bremen. Bremen postal codes start with 28.' 
    };
  }

  return { isValid: true };
}

/**
 * Validate complete delivery address
 */
export interface AddressValidation {
  isValid: boolean;
  errors: {
    street?: string;
    city?: string;
    zipCode?: string;
  };
}

export function validateAddress(address: {
  street: string;
  city: string;
  zipCode: string;
}): AddressValidation {
  const errors: AddressValidation['errors'] = {};
  
  const streetValidation = validateStreet(address.street);
  if (!streetValidation.isValid) {
    errors.street = streetValidation.error;
  }

  const cityValidation = validateCity(address.city);
  if (!cityValidation.isValid) {
    errors.city = cityValidation.error;
  }

  const zipValidation = validateBremenZipCode(address.zipCode);
  if (!zipValidation.isValid) {
    errors.zipCode = zipValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If starts with +49, format as +49 XXX XXXXXXX
  if (cleaned.startsWith('+49')) {
    const numbers = cleaned.substring(3);
    if (numbers.length >= 3) {
      return `+49 ${numbers.substring(0, 3)} ${numbers.substring(3)}`;
    }
    return `+49 ${numbers}`;
  }
  
  // If starts with 0, format as 0XXX XXXXXXX
  if (cleaned.startsWith('0')) {
    if (cleaned.length >= 4) {
      return `${cleaned.substring(0, 4)} ${cleaned.substring(4)}`;
    }
  }
  
  return phone;
}

/**
 * Validate tip amount
 */
export function validateTip(tip: number, orderTotal: number): ValidationResult {
  if (tip < 0) {
    return { isValid: false, error: 'Tip amount cannot be negative' };
  }

  if (tip > orderTotal) {
    return { isValid: false, error: 'Tip amount cannot exceed order total' };
  }

  if (tip > orderTotal * 2) {
    return { isValid: false, error: 'Tip amount seems unusually high. Please verify.' };
  }

  return { isValid: true };
}
