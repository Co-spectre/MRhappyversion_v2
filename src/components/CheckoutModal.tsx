import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { X, MapPin, Phone, Check, Mail, ArrowLeft, ArrowRight, Loader2, AlertCircle, Store, CreditCard, Wallet, Banknote, Shield, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { findNearestLocation, formatDistance, calculateDistance, RESTAURANT_LOCATIONS, type Coordinates } from '../utils/locationUtils';
import { restaurants } from '../data/restaurants';


interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeliveryAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  zipCode: string;
  phone: string;
  instructions?: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'cash';
  name: string;
  details: string;
  IconComponent: React.ComponentType<{ className?: string }>;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { state: authState } = useAuth();
  const { state: cartState, getTotalPrice, dispatch: cartDispatch } = useCart();
  const { createOrder } = useOrder();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get restaurant ID from cart items
  const restaurantId = cartState.items.length > 0 ? cartState.items[0].menuItem.restaurantId : null;
  const currentRestaurant = restaurantId ? restaurants.find(r => r.id === restaurantId) : null;
  
  // Order Type
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('pickup');
  
  // Customer Information - Auto-fill from user profile
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  // Auto-fill customer info when modal opens or user logs in
  useEffect(() => {
    if (authState.user && isOpen) {
      const nameParts = authState.user.name.split(' ');
      setCustomerInfo({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: authState.user.email || '',
        phone: authState.user.phone || ''
      });
    }
  }, [authState.user, isOpen]);

  // Delivery Information
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress | null>(null);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    zipCode: '',
    phone: '',
    instructions: ''
  });
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Payment Information
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const [tipAmount, setTipAmount] = useState(0);

  // Location context for geolocation and modal
  const {
    isLocationEnabled,
    location,
    setLocation,
    clearLocation
  } = useLocation();

  // Location permission modal state
  const [showLocationPermissionModal, setShowLocationPermissionModal] = useState(false);
  const [deliveryAvailabilityChecked, setDeliveryAvailabilityChecked] = useState(false);
  const [addressDeliveryStatus, setAddressDeliveryStatus] = useState<{[key: string]: {canDeliver: boolean, distance: number}}>({});
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  
  // Auto location detection state
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
    street?: string;
    city?: string;
    zipCode?: string;
    distances?: Array<{
      id: string;
      name: string;
      distance: number;
      deliveryRadius: number;
    }>;
  } | null>(null);

  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{
    display_name: string;
    address: {
      road?: string;
      house_number?: string;
      city?: string;
      town?: string;
      village?: string;
      postcode?: string;
      country?: string;
    };
    lat: string;
    lon: string;
  }>>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check delivery availability whenever location changes
  useEffect(() => {
    if (location && orderType === 'delivery' && !deliveryAvailabilityChecked) {
      const eligibility = checkEligibility(location);
      if (!eligibility.canDeliver) {
        // Automatically switch to pickup if delivery not available
        setOrderType('pickup');
        setErrors(prev => ({
          ...prev,
          delivery: `Delivery not available at your location (${eligibility.distance.toFixed(1)}km from nearest restaurant). Only pickup is available.`
        }));
      } else {
        // Clear any delivery errors if delivery is available
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.delivery;
          return newErrors;
        });
      }
      setDeliveryAvailabilityChecked(true);
    }
  }, [location, orderType, deliveryAvailabilityChecked]);

  // Reset delivery availability check when location changes
  useEffect(() => {
    setDeliveryAvailabilityChecked(false);
  }, [location]);

  // Auto-enable delivery if location is available when modal opens
  useEffect(() => {
    if (isOpen && location && isLocationEnabled) {
      console.log('Location detected on modal open:', location);
      console.log('Location enabled status:', isLocationEnabled);
      const eligibility = checkEligibility(location);
      if (eligibility.canDeliver) {
        console.log('Delivery available - enabling delivery option');
      } else {
        console.log('Delivery not available - distance:', eligibility.distance.toFixed(1) + 'km');
      }
    } else if (isOpen) {
      console.log('Modal opened but no location:', {
        location,
        isLocationEnabled,
        hasLocationData: !!location
      });
    }
  }, [isOpen, location, isLocationEnabled]);

  // Location detection and geocoding functions are handled inline

  // Geocode an address and check delivery eligibility
  const geocodeAddressAndCheckDelivery = async (address: string): Promise<{canDeliver: boolean, distance: number, coordinates?: {lat: number, lng: number}} | null> => {
    try {
      setIsGeocodingAddress(true);
      
      // Use OpenStreetMap Nominatim API for geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1&accept-language=en`,
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
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        
        // Check delivery eligibility
        const eligibility = checkEligibility({
          latitude: coordinates.lat,
          longitude: coordinates.lng
        });
        
        console.log('Geocoded address:', address, 'to coordinates:', coordinates, 'delivery:', eligibility.canDeliver);
        
        return {
          canDeliver: eligibility.canDeliver,
          distance: eligibility.distance,
          coordinates
        };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  // Check delivery for address when it changes
  useEffect(() => {
    const checkAddressDelivery = async () => {
      if (useNewAddress && newAddress.street && newAddress.city && newAddress.zipCode) {
        const fullAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.zipCode}`;
        const deliveryInfo = await geocodeAddressAndCheckDelivery(fullAddress);
        
        if (deliveryInfo) {
          setAddressDeliveryStatus(prev => ({
            ...prev,
            [fullAddress]: {
              canDeliver: deliveryInfo.canDeliver,
              distance: deliveryInfo.distance
            }
          }));
          
          // Update location context if address is valid
          if (deliveryInfo.coordinates) {
            setLocation({
              latitude: deliveryInfo.coordinates.lat,
              longitude: deliveryInfo.coordinates.lng,
              accuracy: 100, // Estimated accuracy for geocoded address
              timestamp: Date.now()
            });
          }
        }
      }
    };

    // Debounce the address check
    const timeoutId = setTimeout(checkAddressDelivery, 1000);
    return () => clearTimeout(timeoutId);
  }, [newAddress.street, newAddress.city, newAddress.zipCode, useNewAddress, setLocation]);

  // Address management - no saved addresses, just use for current order

  // Auto-detect user's precise location using GPS
  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    setDetectedLocation(null);
    
    try {
      // Request high-accuracy GPS location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log('📍 GPS Location detected:', {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            accuracy: `${accuracy.toFixed(0)}m`
          });

          // Reverse geocode to get human-readable address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'de,en',
                  'User-Agent': 'MrHappyRestaurant/1.0'
                }
              }
            );

            if (response.ok) {
              const data = await response.json();
              const addr = data.address;
              
              // Extract address components
              const street = `${addr.road || addr.street || ''} ${addr.house_number || ''}`.trim();
              const city = addr.city || addr.town || addr.village || addr.municipality || 'Bremen';
              const zipCode = addr.postcode || '';
              const fullAddress = data.display_name;

              console.log('🏠 Address detected:', {
                street,
                city,
                zipCode,
                fullAddress
              });

              // Calculate distances to restaurants
              const distances = RESTAURANT_LOCATIONS.map(restaurant => ({
                ...restaurant,
                distance: calculateDistance(
                  { latitude, longitude },
                  restaurant.coordinates
                )
              }));

              // Set detected location with all details
              const locationData = {
                latitude,
                longitude,
                accuracy,
                address: fullAddress,
                street,
                city,
                zipCode,
                distances
              };

              setDetectedLocation(locationData);

              // Auto-fill the new address form
              setNewAddress(prev => ({
                ...prev,
                street: street || prev.street,
                city: city || prev.city,
                zipCode: zipCode || prev.zipCode,
                name: prev.name || 'My Location'
              }));

              // Show success message
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.location;
                return newErrors;
              });

            } else {
              throw new Error('Geocoding failed');
            }
          } catch (geocodeError) {
            console.error('Geocoding error:', geocodeError);
            setErrors(prev => ({
              ...prev,
              location: '⚠️ Could not determine address. Please enter manually.'
            }));
            
            // Still set coordinates for distance calculation
            setDetectedLocation({
              latitude,
              longitude,
              accuracy
            });
          }

          setIsDetectingLocation(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = '❌ Could not detect location. ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location permissions in your browser.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
          }
          
          setErrors(prev => ({
            ...prev,
            location: errorMessage
          }));
          setIsDetectingLocation(false);
        },
        {
          enableHighAccuracy: true, // Request GPS-level accuracy
          timeout: 10000, // 10 second timeout
          maximumAge: 0 // Don't use cached position
        }
      );
    } catch (error) {
      console.error('Auto-detect error:', error);
      setErrors(prev => ({
        ...prev,
        location: '❌ Location detection is not available in your browser.'
      }));
      setIsDetectingLocation(false);
    }
  };

  // Address autocomplete search function with debouncing
  const searchAddresses = async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setShowSuggestions(true);

    try {
      // Search in Bremen area with bias
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=de&viewbox=8.4,53.0,9.0,53.6&bounded=1&limit=5&addressdetails=1`,
        {
          headers: { 'User-Agent': 'MRhappy-Restaurant-App' }
        }
      );
      
      const data = await response.json();
      setAddressSuggestions(data || []);
    } catch (error) {
      console.error('Address search error:', error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const searchQuery = newAddress.street;
    if (searchQuery && searchQuery.length >= 3) {
      const timeoutId = setTimeout(() => {
        searchAddresses(searchQuery);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  }, [newAddress.street]);

  // Select address from autocomplete
  const selectAddressSuggestion = (suggestion: typeof addressSuggestions[0]) => {
    const street = suggestion.address.house_number && suggestion.address.road
      ? `${suggestion.address.house_number} ${suggestion.address.road}`
      : suggestion.address.road || '';
    
    setNewAddress(prev => ({
      ...prev,
      street: street,
      city: suggestion.address.city || suggestion.address.town || suggestion.address.village || 'Bremen',
      zipCode: suggestion.address.postcode || ''
    }));

    // Store coordinates for delivery check
    setDetectedLocation({
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
      accuracy: 50,
      address: suggestion.display_name,
      street: street,
      city: suggestion.address.city || suggestion.address.town || suggestion.address.village || 'Bremen',
      zipCode: suggestion.address.postcode || ''
    });

    setAddressSuggestions([]);
    setShowSuggestions(false);
  };

  const useThisAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.zipCode) {
      setErrors(prev => ({
        ...prev,
        address: 'Please fill in all required address fields'
      }));
      return;
    }

    const addressToUse: DeliveryAddress = {
      id: 'manual-address',
      name: newAddress.name || 'My Address',
      street: newAddress.street,
      city: newAddress.city,
      zipCode: newAddress.zipCode,
      phone: newAddress.phone || customerInfo.phone,
      isDefault: false,
      instructions: newAddress.instructions
    };

    setSelectedAddress(addressToUse);
    setUseNewAddress(false);
    
    console.log('Using address for this order:', addressToUse);
    
    // Clear errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.address;
      return newErrors;
    });
  };



  // Payment methods - All online payments will redirect to Stripe
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card' as const,
      name: 'Card Payment',
      details: 'Credit or Debit Card',
      IconComponent: CreditCard
    },
    {
      id: 'paypal',
      type: 'paypal' as const,
      name: 'PayPal',
      details: 'Pay with PayPal',
      IconComponent: Wallet
    },
    {
      id: 'cash',
      type: 'cash' as const,
      name: 'Cash',
      details: `Pay on ${orderType === 'delivery' ? 'delivery' : 'pickup'}`,
      IconComponent: Banknote
    }
  ];

  // Pre-fill customer information from auth context
  useEffect(() => {
    if (authState.user) {
      const nameParts = authState.user.name.split(' ');
      setCustomerInfo({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: authState.user.email,
        phone: authState.user.phone || ''
      });

      // Set default address if available
      if (authState.user.addresses && authState.user.addresses.length > 0) {
        const defaultAddr = authState.user.addresses.find(addr => addr.isDefault) || authState.user.addresses[0];
        setSelectedAddress({
          id: defaultAddr.id,
          name: defaultAddr.name,
          street: defaultAddr.street,
          city: defaultAddr.city,
          zipCode: defaultAddr.zipCode,
          phone: customerInfo.phone,
          isDefault: defaultAddr.isDefault
        });
      }
    }
  }, [authState.user, customerInfo.phone]);

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setOrderPlaced(false);
      setErrors({});
      setTipAmount(0);
      setOrderNotes('');
      setDeliveryTime('asap');
    }
  }, [isOpen]);

  // Ensure `setDeliveryTime` is used properly
  useEffect(() => {
    if (deliveryTime === 'asap') {
      setDeliveryTime('30 minutes'); // Example logic to set a default delivery time
    }
  }, [deliveryTime]);

  const calculateTotal = () => {
    const subtotal = getTotalPrice();
    const tax = subtotal * 0.19; // 19% VAT in Germany
    const deliveryFee = orderType === 'delivery' ? 2.00 : 0; // €2 for delivery, free for pickup
    const total = subtotal + tax + deliveryFee + tipAmount;
    
    return {
      subtotal,
      tax,
      deliveryFee,
      tip: tipAmount,
      total
    };
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Validate customer information
      if (!customerInfo.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!customerInfo.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!customerInfo.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!customerInfo.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
    } else if (step === 2) {
      // Validate delivery information
      if (!selectedAddress && !useNewAddress) {
        newErrors.address = 'Please select or add a delivery address';
      }
      if (useNewAddress) {
        if (!newAddress.street.trim()) newErrors.street = 'Street address is required';
        if (!newAddress.city.trim()) newErrors.city = 'City is required';
        if (!newAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        if (!newAddress.phone.trim()) newErrors.phone = 'Phone number is required';
      }
    } else if (step === 3) {
      // Validate payment information
      if (!selectedPayment) {
        newErrors.payment = 'Please select a payment method';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    try {
      const totals = calculateTotal();
      
      // Create order with full customer information
      await createOrder(cartState.items, authState.user!.id, {
        customerInfo,
        orderType,
        deliveryFee: totals.deliveryFee,
        tip: totals.tip,
        total: totals.total
      });
      
      // Clear cart
      cartDispatch({ type: 'CLEAR_CART' });
      
      setOrderPlaced(true);
      setCurrentStep(4);
    } catch {
      setErrors({ general: 'Failed to place order. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderCustomerInfoStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Customer Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={customerInfo.firstName}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
            className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
              errors.firstName ? 'border-red-600' : 'border-gray-700'
            }`}
            placeholder="First name"
          />
          {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={customerInfo.lastName}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
            className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
              errors.lastName ? 'border-red-600' : 'border-gray-700'
            }`}
            placeholder="Last name"
          />
          {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full pl-10 pr-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
              errors.email ? 'border-red-600' : 'border-gray-700'
            }`}
            placeholder="your.email@example.com"
          />
        </div>
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Phone Number *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
            className={`w-full pl-10 pr-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
              errors.phone ? 'border-red-600' : 'border-gray-700'
            }`}
            placeholder="+49 123 456 7890"
          />
        </div>
        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
      </div>
    </div>
  );

  const renderDeliveryStep = () => {
    // Get user's delivery address from signup
    const userDeliveryAddress = authState.user?.deliveryAddress;

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">📍 Delivery Location</h3>
          <p className="text-gray-400">We'll detect your location automatically for fastest delivery</p>
        </div>
        
        {/* AUTO-DETECTED GPS LOCATION (PRIORITY #1) */}
        {location && location.address && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-green-400 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Your Current Location (GPS)</span>
              </h4>
              <button
                onClick={() => {
                  clearLocation();
                  setDetectedLocation(null);
                }}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                🔄 Change Location
              </button>
            </div>
            
            <div 
              onClick={() => {
                // Auto-select GPS location
                setSelectedAddress({
                  id: 'gps-location',
                  name: 'Current Location',
                  street: location.address?.street || 'Detected Address',
                  city: location.address?.city || 'Bremen',
                  zipCode: location.address?.postalCode || '',
                  phone: customerInfo.phone,
                  isDefault: false
                });
              }}
              className={`group cursor-pointer p-6 border-2 rounded-2xl transition-all duration-300 ${
                selectedAddress?.id === 'gps-location'
                  ? 'border-green-500 bg-gradient-to-br from-green-900/30 to-green-800/20 shadow-lg shadow-green-500/20'
                  : 'border-green-600/50 bg-gradient-to-br from-green-900/20 to-gray-900/50 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-3 rounded-full ${
                      selectedAddress?.id === 'gps-location'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-green-600/20 text-green-500'
                    }`}>
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-lg">Current Location</h5>
                      <span className="text-xs bg-green-600/30 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30">
                        📍 Auto-Detected via GPS
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-16 space-y-2">
                    <p className="text-gray-200 font-medium text-lg">
                      {location.address.street || location.address.formatted}
                    </p>
                    <p className="text-gray-300">
                      {location.address.city} {location.address.postalCode}
                    </p>
                    <p className="text-gray-400 text-sm">
                      📍 Accuracy: ±{location.accuracy.toFixed(0)}m
                    </p>
                  </div>

                  {/* Restaurant Distance Indicators */}
                  <div className="mt-4 ml-16 space-y-2">
                    <p className="text-sm font-semibold text-gray-400 mb-2">🚗 Distance to Restaurants:</p>
                    {RESTAURANT_LOCATIONS.map((restaurant) => {
                      const distance = calculateDistance(
                        { latitude: location.latitude, longitude: location.longitude },
                        restaurant.coordinates
                      );
                      const withinRange = distance <= restaurant.deliveryRadius;
                      const restaurantIcon = restaurant.id === 'vegesack' ? '🍔' : '🍕';
                      
                      return (
                        <div key={restaurant.id} className={`flex items-center justify-between p-3 rounded-xl ${
                          withinRange 
                            ? 'bg-green-900/30 border border-green-600/30' 
                            : 'bg-red-900/20 border border-red-600/30'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{restaurantIcon}</span>
                            <div>
                              <p className={`font-semibold ${withinRange ? 'text-green-300' : 'text-red-300'}`}>
                                {restaurant.name}
                              </p>
                              <p className="text-xs text-gray-400">Max: {restaurant.deliveryRadius}km</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${withinRange ? 'text-green-400' : 'text-red-400'}`}>
                              {formatDistance(distance)}
                            </p>
                            <p className={`text-xs ${withinRange ? 'text-green-500' : 'text-red-500'}`}>
                              {withinRange ? '✓ Can Deliver' : '✗ Too Far'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Quick Action Button */}
                  {selectedAddress?.id !== 'gps-location' && (
                    <div className="mt-4 ml-16">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAddress({
                            id: 'gps-location',
                            name: 'Current Location',
                            street: location.address?.street || 'Detected Address',
                            city: location.address?.city || 'Bremen',
                            zipCode: location.address?.postalCode || '',
                            phone: customerInfo.phone,
                            isDefault: false
                          });
                        }}
                        className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors"
                      >
                        👆 Click here to deliver to this location
                      </button>
                    </div>
                  )}
                </div>
                
                {selectedAddress?.id === 'gps-location' && (
                  <div className="ml-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* NO LOCATION DETECTED - SHOW DETECTION BUTTON */}
        {!location && !isDetectingLocation && (
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-2 border-blue-600/50 rounded-2xl p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-blue-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">
                📍 Let's Find Your Location
              </h4>
              <p className="text-gray-300 mb-1">
                We'll automatically detect your address for fastest delivery
              </p>
              <p className="text-sm text-blue-300">
                This helps us check if we can deliver to you and calculate accurate delivery times
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsDetectingLocation(true);
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: Date.now()
                      };
                      
                      // Geocode to get address
                      try {
                        const response = await fetch(
                          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1&accept-language=en`,
                          {
                            headers: { 'User-Agent': 'MRhappy-Restaurant-App' }
                          }
                        );
                        const data = await response.json();
                        
                        if (data && data.address) {
                          const address = {
                            street: data.address.road || data.address.house_number 
                              ? `${data.address.house_number || ''} ${data.address.road || ''}`.trim()
                              : 'Detected Address',
                            city: data.address.city || data.address.town || data.address.village || 'Bremen',
                            postalCode: data.address.postcode || '',
                            country: data.address.country,
                            formatted: data.display_name
                          };
                          
                          setLocation({
                            ...coords,
                            address
                          });
                        }
                      } catch (error) {
                        console.error('Geocoding error:', error);
                        setLocation(coords);
                      }
                      
                      setIsDetectingLocation(false);
                    },
                    (error) => {
                      console.error('Geolocation error:', error);
                      setIsDetectingLocation(false);
                      setErrors(prev => ({
                        ...prev,
                        location: 'Could not detect location. Please enter address manually below.'
                      }));
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 10000,
                      maximumAge: 0
                    }
                  );
                } else {
                  setIsDetectingLocation(false);
                  setErrors(prev => ({
                    ...prev,
                    location: 'Geolocation not supported. Please enter address manually.'
                  }));
                }
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 hover:scale-105"
            >
              📍 Detect My Location Now
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              We use your location only to check delivery availability and calculate distances
            </p>
          </div>
        )}
        
        {/* DETECTING LOCATION LOADER */}
        {isDetectingLocation && (
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-2 border-blue-600/50 rounded-2xl p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h4 className="text-xl font-bold text-white mb-2">
                🔍 Detecting Your Location...
              </h4>
              <p className="text-gray-300">
                Please allow location access in your browser
              </p>
            </div>
          </div>
        )}
        
        {/* DIVIDER */}
        {location && (
          <div className="flex items-center space-x-4 my-6">
            <div className="flex-1 h-px bg-gray-700"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-700"></div>
          </div>
        )}
        
        {/* User's Saved Location from Signup */}
        {userDeliveryAddress && !useNewAddress && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-300 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span>Your Saved Location</span>
            </h4>
            
            <div 
              onClick={() => {
                // Auto-select this address
                setSelectedAddress({
                  id: 'user-signup-address',
                  name: 'My Address',
                  street: userDeliveryAddress.street,
                  city: userDeliveryAddress.city,
                  zipCode: userDeliveryAddress.zipCode,
                  phone: authState.user?.phone || customerInfo.phone,
                  isDefault: true
                });
              }}
              className={`group cursor-pointer p-6 border-2 rounded-2xl transition-all duration-300 ${
                selectedAddress?.id === 'user-signup-address'
                  ? 'border-red-500 bg-gradient-to-br from-red-900/30 to-red-800/20 shadow-lg shadow-red-500/20'
                  : 'border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-3 rounded-full ${
                      selectedAddress?.id === 'user-signup-address' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-700 text-gray-300 group-hover:bg-red-500/20 group-hover:text-red-400'
                    } transition-all`}>
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-xl font-bold text-white">My Address</h5>
                      <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs rounded-full font-semibold shadow-lg">
                        ✓ Default Location
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-16 space-y-2">
                    <p className="text-gray-200 font-medium text-lg">
                      {userDeliveryAddress.street}
                    </p>
                    <p className="text-gray-300">
                      {userDeliveryAddress.city} {userDeliveryAddress.zipCode}
                    </p>
                    <p className="text-gray-400 flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{authState.user?.phone || customerInfo.phone}</span>
                    </p>
                  </div>

                  {/* Restaurant Distance Indicators */}
                  <div className="mt-4 ml-16 space-y-2">
                    <p className="text-sm font-semibold text-gray-400 mb-2">📍 Distance to Restaurants:</p>
                    {RESTAURANT_LOCATIONS.map((restaurant) => {
                      // Calculate distance if we have coordinates
                      const distance = userDeliveryAddress.latitude && userDeliveryAddress.longitude
                        ? calculateDistance(
                            { latitude: userDeliveryAddress.latitude, longitude: userDeliveryAddress.longitude },
                            restaurant.coordinates
                          )
                        : null;
                      
                      const withinRange = distance ? distance <= restaurant.deliveryRadius : true;
                      const restaurantIcon = restaurant.id === 'vegesack' ? '🍔' : '🍕';
                      
                      return (
                        <div key={restaurant.id} className={`flex items-center justify-between p-3 rounded-xl ${
                          withinRange 
                            ? 'bg-green-900/30 border border-green-600/30' 
                            : 'bg-red-900/20 border border-red-600/30'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{restaurantIcon}</span>
                            <div>
                              <p className={`font-semibold ${withinRange ? 'text-green-300' : 'text-red-300'}`}>
                                {restaurant.name}
                              </p>
                              <p className="text-xs text-gray-400">Max: {restaurant.deliveryRadius}km</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {distance ? (
                              <>
                                <p className={`font-bold ${withinRange ? 'text-green-400' : 'text-red-400'}`}>
                                  {formatDistance(distance)}
                                </p>
                                <p className={`text-xs ${withinRange ? 'text-green-500' : 'text-red-500'}`}>
                                  {withinRange ? '✓ Available' : '✗ Too far'}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-gray-500">Calculating...</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {selectedAddress?.id === 'user-signup-address' && (
                  <div className="ml-4">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Address Entry Option */}
        {!useNewAddress && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setUseNewAddress(true)}
              className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 shadow-lg hover:shadow-xl"
            >
              📝 Or Enter Address Manually
            </button>
          </div>
        )}

      {/* New Address Form */}
      {useNewAddress && (
          <div className="space-y-6 p-6 bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-2xl border border-gray-700 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-bold text-white flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-red-500" />
                <span>New Delivery Address</span>
              </h4>
            </div>

            {/* Auto Detect Location Button */}
            <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-600/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-white font-semibold">Quick & Accurate</h5>
                    <p className="text-blue-300 text-sm">Detect your exact location automatically</p>
                  </div>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleAutoDetectLocation}
                disabled={isDetectingLocation}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDetectingLocation ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Detecting Your Location...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5" />
                    <span>📍 Auto Detect My Location</span>
                  </>
                )}
              </button>

              {/* Display Detected Location */}
              {detectedLocation && (
                <div className="mt-4 space-y-3 bg-black/30 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center space-x-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">Location Detected Successfully!</span>
                  </div>
                  
                  {/* GPS Coordinates */}
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">GPS Coordinates</p>
                    <p className="text-white font-mono text-sm">
                      📍 {detectedLocation.latitude.toFixed(6)}°N, {detectedLocation.longitude.toFixed(6)}°E
                    </p>
                    <p className="text-blue-300 text-xs">
                      Accuracy: ±{detectedLocation.accuracy.toFixed(0)} meters
                    </p>
                  </div>

                  {/* Detected Address */}
                  {detectedLocation.address && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Detected Address</p>
                      <p className="text-white text-sm">{detectedLocation.address}</p>
                    </div>
                  )}

                  {/* Restaurant Distances */}
                  {detectedLocation.distances && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Distance to Restaurants</p>
                      {detectedLocation.distances.map((restaurant: any) => {
                        const withinRange = restaurant.distance <= restaurant.deliveryRadius;
                        return (
                          <div 
                            key={restaurant.id}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              withinRange ? 'bg-green-900/40' : 'bg-red-900/40'
                            }`}
                          >
                            <span className="text-sm text-white">
                              {restaurant.id === 'vegesack' ? '🍔' : '🍕'} {restaurant.name}
                            </span>
                            <span className={`text-sm font-bold ${
                              withinRange ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatDistance(restaurant.distance)} {withinRange ? '✓' : '✗'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {errors.location && (
                <p className="mt-3 text-red-400 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.location}</span>
                </p>
              )}
            </div>

            {/* Manual Address Entry */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="flex-1 h-px bg-gray-700"></div>
                <span className="text-sm">Or enter manually</span>
                <div className="flex-1 h-px bg-gray-700"></div>
              </div>

              {/* Address Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address Name (Optional)
                </label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Home, Work, etc."
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Street Address *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay to allow clicking on suggestions
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                    errors.street ? 'border-red-600' : 'border-gray-700'
                  }`}
                  placeholder="Start typing your address..."
                  autoComplete="off"
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectAddressSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-900/30 transition-colors border-b border-gray-800 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-4 h-4 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">
                            {suggestion.address.house_number && suggestion.address.road
                              ? `${suggestion.address.house_number} ${suggestion.address.road}`
                              : suggestion.address.road || suggestion.display_name}
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {[
                              suggestion.address.postcode,
                              suggestion.address.city || suggestion.address.town || suggestion.address.village
                            ].filter(Boolean).join(' ')}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {errors.street && <p className="text-red-400 text-sm mt-1">{errors.street}</p>}
              
              {/* Address delivery status indicator */}
              {newAddress.street && newAddress.city && newAddress.zipCode && (
                <div className="mt-2">
                  {isGeocodingAddress ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-400 text-sm">Checking delivery availability...</span>
                    </div>
                  ) : (() => {
                    const fullAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.zipCode}`;
                    const deliveryStatus = addressDeliveryStatus[fullAddress];
                    
                    if (deliveryStatus) {
                      return deliveryStatus.canDeliver ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-400 text-sm">
                            ✅ Delivery available ({deliveryStatus.distance.toFixed(1)}km away)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-400 text-sm">
                            🚫 Outside delivery range ({deliveryStatus.distance.toFixed(1)}km away) - pickup only
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City *
              </label>
              <input
                type="text"
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  errors.city ? 'border-red-600' : 'border-gray-700'
                }`}
                placeholder="Bremen"
              />
              {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                value={newAddress.zipCode}
                onChange={(e) => setNewAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  errors.zipCode ? 'border-red-600' : 'border-gray-700'
                }`}
                placeholder="28195"
              />
              {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Delivery Instructions (Optional)
            </label>
            <textarea
              value={newAddress.instructions}
              onChange={(e) => setNewAddress(prev => ({ ...prev, instructions: e.target.value }))}
              className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Ring doorbell, leave at door, etc."
              rows={3}
            />
          </div>

          {/* Use Address Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={useThisAddress}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ✅ Use This Address
            </button>
            <button
              type="button"
              onClick={() => setUseNewAddress(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delivery Time */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-3">Delivery Time</h4>
        <div className="text-green-500 text-base">
          Your order will be delivered in 15-30 mins.
        </div>
      </div>

      {errors.address && <p className="text-red-400 text-sm">{errors.address}</p>}
    </div>
    );
  };

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Payment & Review</h3>
      
      {/* Order Type Selection */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-3">Order Type</h4>
        <div className="grid grid-cols-2 gap-4">
          {(() => {
            // Check if delivery is available based on current location/address
            let deliveryAvailable = true;
            let deliveryMessage = "";
            
            if (location) {
              const eligibility = checkEligibility(location);
              deliveryAvailable = eligibility.canDeliver;
              if (!deliveryAvailable) {
                deliveryMessage = `Outside ${eligibility.distance.toFixed(1)}km delivery zone`;
              }
            } else if (selectedAddress) {
              const fullAddress = `${selectedAddress.street}, ${selectedAddress.city} ${selectedAddress.zipCode}`;
              const deliveryStatus = addressDeliveryStatus[fullAddress];
              if (deliveryStatus) {
                deliveryAvailable = deliveryStatus.canDeliver;
                if (!deliveryAvailable) {
                  deliveryMessage = `Outside ${deliveryStatus.distance.toFixed(1)}km delivery zone`;
                }
              }
            } else if (useNewAddress && newAddress.street && newAddress.city && newAddress.zipCode) {
              const fullAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.zipCode}`;
              const deliveryStatus = addressDeliveryStatus[fullAddress];
              if (deliveryStatus) {
                deliveryAvailable = deliveryStatus.canDeliver;
                if (!deliveryAvailable) {
                  deliveryMessage = `Outside ${deliveryStatus.distance.toFixed(1)}km delivery zone`;
                }
              }
            }
            
            return (
              <button
                onClick={() => {
                  if (!deliveryAvailable) {
                    setErrors(prev => ({
                      ...prev,
                      delivery: '🚫 Sorry, we cannot deliver to your address. Please select pickup instead.'
                    }));
                    return;
                  }
                  
                  // When delivery is selected, check if we have location first
                  if (location && isLocationEnabled) {
                    // We already have location, check delivery availability
                    console.log('Using existing location:', location);
                    const eligibility = checkEligibility(location);
                    if (eligibility.canDeliver) {
                      setOrderType('delivery');
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.delivery;
                        return newErrors;
                      });
                    } else {
                      // Show error message and keep pickup selected
                      setOrderType('pickup');
                      setErrors(prev => ({
                        ...prev,
                        delivery: `🚫 Oops! We cannot deliver to your location. You are ${eligibility.distance.toFixed(1)}km away from our nearest restaurant. Pickup is only available.`
                      }));
                    }
                  } else {
                    // No location available, show permission modal
                    console.log('No location available, requesting permission');
                    setShowLocationPermissionModal(true);
                  }
                }}
                className={`p-4 border rounded-lg transition-all ${
                  orderType === 'delivery'
                    ? 'border-red-600 bg-red-900/20 text-white'
                    : deliveryAvailable
                    ? 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-700 bg-gray-800/30 text-gray-500 opacity-50 cursor-not-allowed'
                }`}
                disabled={!deliveryAvailable}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🚚</div>
                  <div className="font-medium">Delivery</div>
                  <div className="text-sm opacity-75">We'll deliver to your address</div>
                  <div className={`text-sm font-bold mt-1 ${deliveryAvailable ? 'text-red-400' : 'text-gray-500'}`}>
                    +€2.00
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {deliveryAvailable ? 'Delivery available' : deliveryMessage}
                  </div>
                </div>
              </button>
            );
          })()}
          <button
            onClick={() => {
              setOrderType('pickup');
              // Clear any delivery errors when switching to pickup
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.delivery;
                return newErrors;
              });
            }}
            className={`p-4 border rounded-lg transition-all ${
              orderType === 'pickup'
                ? 'border-red-600 bg-red-900/20 text-white'
                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🏪</div>
              <div className="font-medium">Pickup</div>
              <div className="text-sm opacity-75">Pick up from our restaurant</div>
              <div className="text-sm font-bold text-green-400 mt-1">FREE</div>
              <div className="text-xs text-gray-400 mt-1">Available at all locations</div>
            </div>
          </button>
        </div>
        
        {/* Pickup Location Info */}
        {orderType === 'pickup' && currentRestaurant && (
          <div className="mt-4 bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-full flex-shrink-0">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-2">📍 Pick up from:</h4>
                <p className="text-lg font-bold text-blue-300 mb-2">{currentRestaurant.name}</p>
                <div className="space-y-1 text-sm text-blue-200">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    {currentRestaurant.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    {currentRestaurant.phone}
                  </p>
                </div>
                <div className="mt-3 p-2 bg-green-900/30 border border-green-600 rounded text-center">
                  <p className="text-green-400 text-sm font-semibold">
                    ⏱️ Ready in {currentRestaurant.deliveryTime?.split('-')[0] || '15-20'} minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {errors.delivery && (
          <div className="mt-3 p-4 bg-red-900/50 border border-red-600 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Delivery Not Available</p>
                <p className="text-red-300 text-sm mt-1">{errors.delivery}</p>
                <div className="mt-3 p-3 bg-blue-900/30 border border-blue-600 rounded">
                  <p className="text-blue-300 text-xs">
                    💡 <strong>How to enable location:</strong><br/>
                    • Click the location icon in your browser's address bar<br/>
                    • Select "Allow" when prompted for location access<br/>
                    • Or manually enter your address for delivery estimation
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Payment Methods */}
      <div>
        <h4 className="text-xl font-bold text-white mb-6">Choose Payment Method</h4>
        
        {/* Payment Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {paymentMethods.map((method) => {
            const IconComponent = method.IconComponent;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method)}
                className={`group relative p-6 border-2 rounded-xl transition-all duration-200 ${
                  selectedPayment?.id === method.id
                    ? 'border-red-500 bg-gradient-to-br from-red-500/10 to-red-600/5 shadow-lg shadow-red-500/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/80'
                }`}
              >
                {/* Selected Indicator */}
                {selectedPayment?.id === method.id && (
                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {/* Icon */}
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  selectedPayment?.id === method.id
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-700/50 text-gray-400 group-hover:bg-gray-700 group-hover:text-gray-300'
                }`}>
                  <IconComponent className="w-8 h-8" />
                </div>
                
                {/* Name */}
                <h5 className={`text-lg font-bold text-center mb-1 transition-colors ${
                  selectedPayment?.id === method.id ? 'text-white' : 'text-gray-200 group-hover:text-white'
                }`}>
                  {method.name}
                </h5>
                
                {/* Details */}
                <p className="text-sm text-gray-400 text-center">
                  {method.details}
                </p>
                
                {/* Online Payment Badge */}
                {method.id !== 'cash' && (
                  <div className="mt-4 flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">
                      Powered by Stripe
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Payment Info Banner - Online Payments */}
        {selectedPayment && selectedPayment.id !== 'cash' && (
          <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/20 p-3 rounded-lg flex-shrink-0">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h5 className="text-white font-bold mb-2 flex items-center gap-2">
                  Secure Payment Processing
                  <span className="text-xs font-normal px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                    SSL Encrypted
                  </span>
                </h5>
                <p className="text-sm text-blue-200 mb-3 leading-relaxed">
                  When you click "Place Order", you'll be securely redirected to <strong>Stripe's checkout page</strong> to complete your payment. Stripe is trusted by millions of businesses worldwide.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-blue-300">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>PCI DSS Level 1</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-300">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-300">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>3D Secure</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-300">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Fraud Protection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Info Banner - Cash */}
        {selectedPayment && selectedPayment.id === 'cash' && (
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="bg-green-500/20 p-3 rounded-lg flex-shrink-0">
                <Banknote className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h5 className="text-white font-bold mb-2">Cash Payment</h5>
                <p className="text-sm text-green-200 leading-relaxed">
                  No online payment required. Simply pay with cash when you {orderType === 'delivery' ? 'receive your delivery' : 'pick up your order at the restaurant'}. 
                  Please have exact change if possible.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {errors.payment && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.payment}</span>
          </div>
        )}
      </div>

      {/* Tip */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-3">Add Tip (Optional)</h4>
        <div className="grid grid-cols-4 gap-3 mb-3">
          {[0, 2, 3, 5].map((tip) => (
            <button
              key={tip}
              onClick={() => setTipAmount(tip)}
              className={`py-2 px-4 rounded-lg border transition-all ${
                tipAmount === tip
                  ? 'border-red-600 bg-red-900/20 text-red-400'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tip === 0 ? 'No Tip' : `€${tip}`}
            </button>
          ))}
        </div>
        <input
          type="number"
          min="0"
          step="0.50"
          value={tipAmount}
          onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          placeholder="Custom tip amount"
        />
      </div>

      {/* Order Notes */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-3">Special Instructions (Optional)</h4>
        <textarea
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600"
          placeholder="Any special requests for your order..."
          rows={3}
        />
      </div>

      {/* Order Summary */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h4 className="text-lg font-medium text-gray-300 mb-3">Order Summary</h4>
        <div className="space-y-2">
          {(() => {
            const totals = calculateTotal();
            return (
              <>
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>€{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (19%)</span>
                  <span>€{totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Delivery Fee ({orderType === 'pickup' ? 'Pickup' : 'Delivery'})</span>
                  <span>{totals.deliveryFee === 0 ? 'FREE' : `€${totals.deliveryFee.toFixed(2)}`}</span>
                </div>
                {tipAmount > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Tip</span>
                    <span>€{totals.tip.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>€{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {errors.general && (
        <div className="p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-400 text-sm">
          {errors.general}
        </div>
      )}
    </div>
  );

  const renderOrderConfirmation = () => {
    const totals = calculateTotal();
    const estimatedTime = orderType === 'delivery' ? '30-45 minutes' : '15-20 minutes';
    
    return (
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-green-600 rounded-full flex items-center justify-center animate-scaleIn">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-white mt-4 mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-300">Thank you for choosing Mr. Happy!</p>
        </div>

        {/* Restaurant Info */}
        {currentRestaurant && (
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-600/30 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="bg-red-600 p-2 rounded-full flex-shrink-0">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-2">
                  {orderType === 'pickup' ? 'Pick up from:' : 'Order from:'}
                </h4>
                <p className="text-xl font-semibold text-red-400 mb-2">{currentRestaurant.name}</p>
                <div className="space-y-1 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{currentRestaurant.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{currentRestaurant.phone}</span>
                  </div>
                </div>
                {orderType === 'pickup' && (
                  <div className="mt-3 p-3 bg-blue-900/30 border border-blue-600 rounded">
                    <p className="text-blue-300 text-sm font-medium">
                      📍 Please pick up your order from the address above
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">Order Details</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-700">
              <span className="text-gray-400">Order Number:</span>
              <span className="text-white font-mono font-bold text-lg">#{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Order Type:</span>
              <span className="text-white font-semibold capitalize">{orderType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Estimated Time:</span>
              <span className="text-green-400 font-semibold">{estimatedTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Payment Method:</span>
              <span className="text-white">Cash on {orderType === 'delivery' ? 'Delivery' : 'Pickup'}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
          <h4 className="text-lg font-bold text-white mb-4">Your Items</h4>
          <div className="space-y-3">
            {cartState.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-white font-medium">{item.menuItem.name}</p>
                  {item.customizations && item.customizations.length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      Customized ({item.customizations.length} changes)
                    </p>
                  )}
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-white font-semibold">€{item.totalPrice.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          {/* Price Breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-white">€{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tax (19%):</span>
              <span className="text-white">€{totals.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Delivery Fee:</span>
              <span className="text-white">{totals.deliveryFee === 0 ? 'FREE' : `€${totals.deliveryFee.toFixed(2)}`}</span>
            </div>
            {tipAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tip:</span>
                <span className="text-white">€{tipAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
              <span className="text-white">Total:</span>
              <span className="text-red-500">€{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery/Pickup Address */}
        {orderType === 'delivery' && selectedAddress && (
          <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Delivery Address:</h4>
            <p className="text-blue-300">{selectedAddress.street}</p>
            <p className="text-blue-300">{selectedAddress.city}, {selectedAddress.zipCode}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {/* Future: Navigate to orders page */}}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Track Order
          </button>
        </div>

        {/* Success Message */}
        <div className="text-center p-4 bg-green-900/20 border border-green-600 rounded-lg">
          <p className="text-green-400 text-sm">
            ✅ Your order has been sent to the restaurant. You'll receive updates as it progresses!
          </p>
        </div>
      </div>
    );
  };

  // Fix renderStepContent definition
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {renderCustomerInfoStep()}
          </>
        );
      case 2:
        return renderDeliveryStep();
      case 3:
        return renderPaymentStep();
      case 4:
        return renderOrderConfirmation();
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 shadow-xl rounded-2xl border border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">
                {orderPlaced ? 'Order Confirmation' : 'Checkout'}
              </h2>
              {!orderPlaced && (
                <div className="flex items-center space-x-4 mt-2">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {currentStep > step ? <Check className="w-4 h-4" /> : step}
                      </div>
                      {step < 3 && (
                        <div className={`w-8 h-1 mx-2 ${
                          currentStep > step ? 'bg-red-600' : 'bg-gray-700'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Restaurant Banner */}
          {currentRestaurant && !orderPlaced && (
            <div className="mb-6 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-full">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    Your order from: {currentRestaurant.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-red-400" />
                      <span>{currentRestaurant.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-red-400" />
                      <span>{currentRestaurant.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          {!orderPlaced && currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order - €{calculateTotal().total.toFixed(2)}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Location Permission Modal */}
        {showLocationPermissionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              <h3 className="text-lg font-semibold text-white">Enable Location for Delivery</h3>
            </div>
            
            <div className="space-y-3 mb-6">
              <p className="text-gray-300 text-sm">
                We need your location to check if we can deliver delicious food to you! 🍔
              </p>
              <p className="text-gray-300 text-sm">
                Your location will only be used to calculate delivery distance and won't be stored.
              </p>
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-3">
                <p className="text-green-300 text-xs">
                  ✅ <strong>Delivery ranges:</strong><br/>
                  • Vegesack: 5km radius<br/>
                  • Schwanewede: 10km radius
                </p>
              </div>
            </div>              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowLocationPermissionModal(false);
                    // Request location permission through browser's geolocation API
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        // Location granted - update context and check delivery availability
                        const newLocation = {
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude,
                          accuracy: position.coords.accuracy,
                          timestamp: Date.now()
                        };
                        
                        // Update the location context
                        setLocation(newLocation);
                        console.log('Location granted and saved:', position.coords.latitude, position.coords.longitude);
                        
                        // Check if delivery is available at this location
                        const eligibility = checkEligibility(newLocation);
                        
                        if (eligibility.canDeliver) {
                          setOrderType('delivery');
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.delivery;
                            return newErrors;
                          });
                        } else {
                          // Show error message and keep pickup selected
                          setOrderType('pickup');
                          setErrors(prev => ({
                            ...prev,
                            delivery: `🚫 Sorry! We cannot deliver to your location. You are ${eligibility.distance.toFixed(1)}km away from our nearest restaurant. Pickup is available at all locations.`
                          }));
                        }
                      },
                      (error) => {
                        // Location denied or error
                        console.error('Location error:', error);
                        setOrderType('pickup');
                        let errorMessage = '';
                        
                        switch(error.code) {
                          case error.PERMISSION_DENIED:
                            errorMessage = '📍 Location access was denied. Please enable location services in your browser settings and try again, or select pickup instead.';
                            break;
                          case error.POSITION_UNAVAILABLE:
                            errorMessage = '📍 Location information is unavailable. Please select pickup or try again.';
                            break;
                          case error.TIMEOUT:
                            errorMessage = '📍 Location request timed out. Please select pickup or try again.';
                            break;
                          default:
                            errorMessage = '📍 Unable to get your location. Please select pickup or enable location services.';
                        }
                        
                        setErrors(prev => ({
                          ...prev,
                          delivery: errorMessage
                        }));
                      },
                      {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000 // 5 minutes
                      }
                    );
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Allow Location Access
                </button>
                <button
                  onClick={() => {
                    setShowLocationPermissionModal(false);
                    setOrderType('pickup');
                    setErrors(prev => ({
                      ...prev,
                      delivery: '📍 Location access is required for delivery. Pickup is available at all our restaurants.'
                    }));
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Use Pickup Instead
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Update checkEligibility to use userLocation and proper delivery radius
const checkEligibility = (userLocation: {
  latitude: number;
  longitude: number;
}): { canDeliver: boolean; distance: number; message: string; nearestLocation?: string; deliveryRadius?: number } => {
  // Use our centralized location system with proper delivery radius
  // Vegesack: 5km radius, Schwanewede: 10km radius
  const userCoords: Coordinates = {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude
  };

  // Find nearest location and check if within delivery range
  const nearest = findNearestLocation(userCoords);
  
  if (!nearest) {
    return {
      canDeliver: false,
      distance: 0,
      message: '❌ Unable to determine delivery availability. Please select pickup.'
    };
  }

  const { location, distance, withinDeliveryRange } = nearest;
  
  const message = withinDeliveryRange
    ? `✅ Delivery available!`
    : `❌ You are ${formatDistance(distance)} from ${location.name}. Maximum delivery range is ${location.deliveryRadius}km. 🛵 Pickup is available at all locations!`;

  return {
    canDeliver: withinDeliveryRange,
    distance,
    message,
    nearestLocation: location.name,
    deliveryRadius: location.deliveryRadius
  };
};

export default CheckoutModal;
