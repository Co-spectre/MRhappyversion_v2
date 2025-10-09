import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from '../context/LocationContext';
import { X, MapPin, Phone, Check, Mail, ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import { geocodeBremenAddress, checkAddressDeliveryEligibility, BremenAddress } from '../utils/bremenGeocoding';
import { getLocationAndAddress, isBremenArea } from '../utils/geolocation';
import { restaurants } from '../data/restaurants';

import { CartItem } from '../types';


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
  icon: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { state: authState } = useAuth();
  const { state: cartState, getTotalPrice, dispatch: cartDispatch } = useCart();
  const { createOrder } = useOrder();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Order Type
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('pickup');
  
  // Customer Information
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

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
    setLocation
  } = useLocation();

  // Location permission modal state
  const [showLocationPermissionModal, setShowLocationPermissionModal] = useState(false);
  const [deliveryAvailabilityChecked, setDeliveryAvailabilityChecked] = useState(false);
  const [addressDeliveryStatus, setAddressDeliveryStatus] = useState<{[key: string]: {canDeliver: boolean, distance: number}}>({});
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Geocode an address and check delivery eligibility
  const geocodeAddressAndCheckDelivery = useCallback((street: string, city: string, zipCode: string): {canDeliver: boolean, distance: number, coordinates?: {lat: number, lng: number}} | null => {
    try {
      setIsGeocodingAddress(true);
      
      // Create Bremen address object
      const bremenAddress: BremenAddress = { street, city, zipCode };
      
      // Get restaurant information for delivery radius
      const restaurantId = cartState.items[0]?.menuItem?.restaurantId;
      const deliveryRadius = restaurantId === 'doner-pizza' ? 10 : 2;
      
      // Find restaurant coordinates (use first restaurant as default)
      const restaurant = restaurants.find(r => r.id === 'doner') || restaurants[0];
      if (!restaurant || typeof restaurant.latitude !== 'number' || typeof restaurant.longitude !== 'number') {
        console.error('Restaurant coordinates not found');
        return null;
      }
      
      const restaurantCoords = {
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      };
      
      // Check delivery eligibility using Bremen address system
      const result = checkAddressDeliveryEligibility(bremenAddress, restaurantCoords, deliveryRadius);
      
      // Get geocoded coordinates
      const geocoded = geocodeBremenAddress(bremenAddress);
      
      console.log('Bremen address validation:', bremenAddress, 'delivery:', result.canDeliver, 'distance:', result.distance);
      
      return {
        canDeliver: result.canDeliver,
        distance: result.distance,
        coordinates: geocoded.isValid ? {
          lat: geocoded.latitude,
          lng: geocoded.longitude
        } : undefined
      };
      
    } catch (error) {
      console.error('Bremen address validation error:', error);
      return null;
    } finally {
      setIsGeocodingAddress(false);
    }
  }, [cartState.items]);

  // Auto-fill address using geolocation
  const handleAutoFillLocation = async () => {
    try {
      setIsLoadingLocation(true);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.location;
        return newErrors;
      });

      console.log('🌍 Getting your exact location...');
      
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Your browser does not support location detection. Please enter your address manually.');
      }
      
      const result = await getLocationAndAddress();

      if (!result.success || !result.address) {
        throw new Error(result.error || 'Unable to get your location');
      }

      const { address, coordinates } = result;
      console.log('📍 Location detected:', address);

      // Check if address is in Bremen area
      if (!isBremenArea(address)) {
        setErrors(prev => ({
          ...prev,
          location: `Sorry, we only deliver in Bremen. Your detected location: ${address.city}`
        }));
        return;
      }

      // Auto-fill the address form
      setNewAddress({
        name: 'My Current Location',
        street: address.street,
        city: address.city,
        zipCode: address.zipCode,
        phone: newAddress.phone, // Keep existing phone
        instructions: newAddress.instructions // Keep existing instructions
      });

      // Update location context if coordinates are available
      if (coordinates && setLocation) {
        setLocation({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          accuracy: coordinates.accuracy,
          timestamp: Date.now()
        });
      }

      // Trigger delivery validation
      if (address.street && address.city && address.zipCode) {
        const deliveryInfo = geocodeAddressAndCheckDelivery(address.street, address.city, address.zipCode);
        
        if (deliveryInfo) {
          const fullAddress = `${address.street}, ${address.city}, ${address.zipCode}`;
          setAddressDeliveryStatus(prev => ({
            ...prev,
            [fullAddress]: {
              canDeliver: deliveryInfo.canDeliver,
              distance: deliveryInfo.distance
            }
          }));
        }
      }

      console.log('✅ Address auto-filled successfully!');

    } catch (error) {
      console.error('Auto-location error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unable to get your location';
      setErrors(prev => ({
        ...prev,
        location: errorMessage
      }));
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Check delivery availability whenever location changes
  useEffect(() => {
    if (location && orderType === 'delivery' && !deliveryAvailabilityChecked) {
      const eligibility = checkEligibility(location, cartState.items);
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
  }, [location, orderType, deliveryAvailabilityChecked, cartState.items]);

  // Reset delivery availability check when location changes
  useEffect(() => {
    setDeliveryAvailabilityChecked(false);
  }, [location]);

  // Auto-enable delivery if location is available when modal opens
  useEffect(() => {
    if (isOpen && location && isLocationEnabled) {
      console.log('Location detected on modal open:', location);
      console.log('Location enabled status:', isLocationEnabled);
      const eligibility = checkEligibility(location, cartState.items);
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
  }, [isOpen, location, isLocationEnabled, cartState.items]);

  // Check delivery eligibility for saved addresses on mount
  useEffect(() => {
    const checkSavedAddresses = () => {
      if (savedAddresses.length > 0) {
        for (const address of savedAddresses) {
          const fullAddress = `${address.street}, ${address.city} ${address.zipCode}`;
          if (!addressDeliveryStatus[fullAddress]) {
            const deliveryInfo = geocodeAddressAndCheckDelivery(address.street, address.city, address.zipCode);
            if (deliveryInfo) {
              setAddressDeliveryStatus(prev => ({
                ...prev,
                [fullAddress]: {
                  canDeliver: deliveryInfo.canDeliver,
                  distance: deliveryInfo.distance
                }
              }));
            }
          }
        }
      }
    };

    if (isOpen) {
      checkSavedAddresses();
    }
  }, [isOpen, addressDeliveryStatus, geocodeAddressAndCheckDelivery]);



  // Check delivery for address when it changes
  useEffect(() => {
    const checkAddressDelivery = () => {
      if (useNewAddress && newAddress.street && newAddress.city && newAddress.zipCode) {
        const fullAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.zipCode}`;
        const deliveryInfo = geocodeAddressAndCheckDelivery(newAddress.street, newAddress.city, newAddress.zipCode);
        
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
  }, [newAddress.street, newAddress.city, newAddress.zipCode, useNewAddress, setLocation, geocodeAddressAndCheckDelivery]);

  // Address management functions
  const deleteAddress = (addressId: string) => {
    // In a real app, this would update the backend
    console.log('Address deleted:', addressId);
    
    // If the deleted address was selected, clear the selection
    if (selectedAddress?.id === addressId) {
      setSelectedAddress(null);
    }
  };

  const saveNewAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.zipCode) {
      setErrors(prev => ({
        ...prev,
        address: 'Please fill in all required address fields'
      }));
      return;
    }

    const newAddressWithId = {
      id: Date.now().toString(),
      name: newAddress.name || 'My Address',
      street: newAddress.street,
      city: newAddress.city,
      zipCode: newAddress.zipCode,
      phone: newAddress.phone || customerInfo.phone,
      isDefault: savedAddresses.length === 0,
      instructions: newAddress.instructions
    };

    // In a real app, this would save to backend
    savedAddresses.push(newAddressWithId);
    setSelectedAddress(newAddressWithId);
    setUseNewAddress(false);
    
    console.log('New address saved:', newAddressWithId);
    
    // Clear the form
    setNewAddress({
      name: '',
      street: '',
      city: '',
      zipCode: '',
      phone: '',
      instructions: ''
    });
  };

  // Address-based delivery validation - no GPS needed
  const renderEligibilityStatus = () => {
    return null; // Delivery validation now happens based on address input
  };

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Credit/Debit Card',
      details: 'Visa, Mastercard, American Express',
      icon: '💳'
    },
    {
      id: 'paypal',
      type: 'paypal',
      name: 'PayPal',
      details: 'Pay with your PayPal account',
      icon: '💰'
    },
    {
      id: 'cash',
      type: 'cash',
      name: 'Cash on Delivery',
      details: 'Pay when you receive your order',
      icon: '💵'
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

  const renderDeliveryStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Delivery Information</h3>
      
      {/* Saved Addresses */}
      {savedAddresses.length > 0 && !useNewAddress && (
        <div>
          <h4 className="text-lg font-medium text-gray-300 mb-3">Select Delivery Address</h4>
          <div className="space-y-3">
            {savedAddresses.map((address: DeliveryAddress) => {
              const fullAddress = `${address.street}, ${address.city} ${address.zipCode}`;
              const deliveryStatus = addressDeliveryStatus[fullAddress];
              const isDeliveryAvailable = deliveryStatus?.canDeliver ?? true; // Default to available if not checked yet
              
              return (
                <div
                  key={address.id}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedAddress?.id === address.id
                      ? 'border-red-600 bg-red-900/20'
                      : 'border-gray-700 bg-gray-800/50'
                  } ${!isDeliveryAvailable ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-white">{address.name}</span>
                        {address.isDefault && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Default</span>
                        )}
                        {!isDeliveryAvailable && (
                          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                            No Delivery ({deliveryStatus?.distance.toFixed(1)}km)
                          </span>
                        )}
                        {isDeliveryAvailable && deliveryStatus && (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                            ✓ Delivery ({deliveryStatus.distance.toFixed(1)}km)
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 mt-1">
                        {address.street}, {address.city} {address.zipCode}
                      </p>
                      <p className="text-gray-400 text-sm">{address.phone}</p>
                      {!isDeliveryAvailable && (
                        <p className="text-red-400 text-xs mt-1">
                          🚫 Outside delivery range - pickup only
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedAddress?.id === address.id && (
                        <Check className="w-6 h-6 text-red-400" />
                      )}
                      <button
                        onClick={() => deleteAddress(address.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="Delete address"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add New Address Toggle */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="useNewAddress"
          checked={useNewAddress}
          onChange={(e) => setUseNewAddress(e.target.checked)}
          className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
        />
        <label htmlFor="useNewAddress" className="text-gray-300">
          Use a different address
        </label>
      </div>

      {/* New Address Form */}
      {useNewAddress && (
          <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <h4 className="text-lg font-medium text-gray-300">New Delivery Address</h4>

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

            {/* Auto-fill helper text */}
            <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-3 mb-2">
              <p className="text-blue-300 text-sm">
                💡 <strong>Auto-detect your address:</strong> Click the button below to use GPS location. 
                Your browser may ask for permission to access your location.
              </p>
              <p className="text-blue-200 text-xs mt-1">
                <strong>Having issues?</strong> Make sure location services are enabled in your browser settings or enter your address manually.
              </p>
            </div>

            {/* Auto-fill current location button */}
            <button
              type="button"
              className="mb-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAutoFillLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Getting your location...
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  📍 Use My Current Location
                </>
              )}
            </button>

            {/* Quick fill options for common Bremen areas */}
            <div className="mt-2">
              <p className="text-gray-400 text-xs mb-2">Or use a common Bremen area:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                  onClick={() => setNewAddress(prev => ({
                    ...prev,
                    city: 'Bremen',
                    zipCode: '28195'
                  }))}
                >
                  Bremen Mitte (28195)
                </button>
                <button
                  type="button"
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                  onClick={() => setNewAddress(prev => ({
                    ...prev,
                    city: 'Bremen',
                    zipCode: '28203'
                  }))}
                >
                  Altstadt (28203)
                </button>
                <button
                  type="button"
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                  onClick={() => setNewAddress(prev => ({
                    ...prev,
                    city: 'Bremen',
                    zipCode: '28199'
                  }))}
                >
                  Neustadt (28199)
                </button>
              </div>
            </div>
            
            {errors.location && (
              <div className="bg-red-900/30 border border-red-600/30 rounded-lg p-3 mb-2">
                <p className="text-red-300 text-sm">
                  ⚠️ <strong>Location Error:</strong> {errors.location}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Please enter your Bremen address manually in the fields below.
                </p>
              </div>
            )}



            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={newAddress.street}
                onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  errors.street ? 'border-red-600' : 'border-gray-700'
                }`}
                placeholder="123 Main Street"
              />
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

          {/* Save Address Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={saveNewAddress}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              💾 Save Address
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
              const eligibility = checkEligibility(location, cartState.items);
              deliveryAvailable = eligibility.canDeliver;
              if (!deliveryAvailable) {
                const restaurantId = cartState.items[0]?.menuItem?.restaurantId;
                const radius = restaurantId === 'doner-pizza' ? '10km' : '2km';
                deliveryMessage = `Outside ${radius} delivery zone (${eligibility.distance.toFixed(1)}km away)`;
              }
            } else if (selectedAddress) {
              const fullAddress = `${selectedAddress.street}, ${selectedAddress.city} ${selectedAddress.zipCode}`;
              const deliveryStatus = addressDeliveryStatus[fullAddress];
              if (deliveryStatus) {
                deliveryAvailable = deliveryStatus.canDeliver;
                if (!deliveryAvailable) {
                  const restaurantId = cartState.items[0]?.menuItem?.restaurantId;
                  const radius = restaurantId === 'doner-pizza' ? '10km' : '2km';
                  deliveryMessage = `Outside ${radius} delivery zone (${deliveryStatus.distance.toFixed(1)}km away)`;
                }
              }
            } else if (useNewAddress && newAddress.street && newAddress.city && newAddress.zipCode) {
              const fullAddress = `${newAddress.street}, ${newAddress.city}, ${newAddress.zipCode}`;
              const deliveryStatus = addressDeliveryStatus[fullAddress];
              if (deliveryStatus) {
                deliveryAvailable = deliveryStatus.canDeliver;
                if (!deliveryAvailable) {
                  const restaurantId = cartState.items[0]?.menuItem?.restaurantId;
                  const radius = restaurantId === 'doner-pizza' ? '10km' : '2km';
                  deliveryMessage = `Outside ${radius} delivery zone (${deliveryStatus.distance.toFixed(1)}km away)`;
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
                    const eligibility = checkEligibility(location, cartState.items);
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
                    {deliveryAvailable ? 'Within 2km radius' : deliveryMessage}
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
        <h4 className="text-lg font-medium text-gray-300 mb-3">Payment Method</h4>
        <p className="text-green-500 font-semibold mb-3">Payment Methods</p>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 mb-4">
            <img src="/path/to/paypal-logo.png" alt="PayPal" className="h-8" />
            <img src="/path/to/visa-logo.png" alt="Visa" className="h-8" />
            <img src="/path/to/mastercard-logo.png" alt="MasterCard" className="h-8" />
          </div>

          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedPayment(method)}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-800 ${
                selectedPayment?.id === method.id
                  ? 'border-red-600 bg-red-900/20'
                  : 'border-gray-700 bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <span className="font-medium text-white">{method.name}</span>
                    <p className="text-gray-400 text-sm">{method.details}</p>
                  </div>
                </div>
                {selectedPayment?.id === method.id && (
                  <Check className="w-6 h-6 text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
        {errors.payment && <p className="text-red-400 text-sm mt-2">{errors.payment}</p>}
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

  const renderOrderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-green-600 rounded-full flex items-center justify-center">
        <Check className="w-10 h-10 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Order Placed Successfully!</h3>
        <p className="text-gray-300 mb-2">Thank you for choosing Mr. Happy! Your order has been sent to our kitchen team.</p>
        <p className="text-sm text-yellow-400">You'll receive notifications as your order progresses.</p>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h4 className="text-lg font-medium text-white mb-4">Order Details</h4>
        <div className="space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-gray-300">Order Number:</span>
            <span className="text-white font-mono">MR{Date.now().toString().slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Estimated Delivery:</span>
            <span className="text-white">30-45 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Fix renderStepContent definition
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {renderCustomerInfoStep()}
            {renderEligibilityStatus()}
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
                  ✅ <strong>We deliver within 2km</strong> of our Bremen locations:<br/>
                  • Vegesack • Schwanewede • Bremen City
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
                        const eligibility = checkEligibility(newLocation, cartState.items);
                        
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

export default CheckoutModal;

// Ensure savedAddresses is declared
const savedAddresses: DeliveryAddress[] = [
  {
    id: '1',
    name: 'Home',
    street: 'Hauptstraße 123',
    city: 'Bremen',
    zipCode: '28195',
    phone: '+49 421 123 4567',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Work',
    street: 'Bürostraße 45',
    city: 'Bremen',
    zipCode: '28199',
    phone: '+49 421 987 6543',
    isDefault: false,
  },
];



// Update checkEligibility to use userLocation with restaurant-specific radius
const checkEligibility = (userLocation: {
  latitude: number;
  longitude: number;
}, cartItems?: CartItem[]): { canDeliver: boolean; distance: number; message: string } => {
  // Determine delivery radius based on restaurant in cart
  const getDeliveryRadius = () => {
    if (!cartItems || cartItems.length === 0) return 2; // Default to 2km
    
    const firstItem = cartItems[0];
    const restaurantId = firstItem.menuItem?.restaurantId;
    
    switch(restaurantId) {
      case 'doner': return 2;        // Mr Happy Döner: 2km
      case 'burger': return 2;       // Mr Happy Burger: 2km  
      case 'doner-pizza': return 10; // Döner&Pizza: 10km
      default: return 2;             // Default: 2km
    }
  };

  // Mr. Happy restaurant locations
  const MR_HAPPY_LOCATIONS = [
    { 
      id: 'doner',
      name: 'Mr. Happy Döner - Bremen Vegesack', 
      latitude: 53.1705, 
      longitude: 8.6141,
      address: 'Zum Alten Speicher 1-2, 28759 Bremen Vegesack'
    },
    { 
      id: 'burger',
      name: 'Mr. Happy Burger - Schwanewede', 
      latitude: 53.2333, 
      longitude: 8.5833,
      address: 'Schwanewede Location' 
    },
    { 
      id: 'doner-pizza',
      name: 'Döner&Pizza - Bremen City', 
      latitude: 53.0793, 
      longitude: 8.8017,
      address: 'Bremen City Location' 
    }
  ];

  const DELIVERY_RADIUS = getDeliveryRadius();

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find the closest restaurant
  let closestLocation = null;
  let minDistance = Infinity;

  for (const location of MR_HAPPY_LOCATIONS) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      location.latitude,
      location.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = location;
    }
  }

  const canDeliver = minDistance <= DELIVERY_RADIUS;
  const message = canDeliver 
    ? `✅ Delivery available from ${closestLocation?.name} (${minDistance.toFixed(1)}km away)`
    : `❌ Sorry, delivery is only available within ${DELIVERY_RADIUS}km. Closest location: ${closestLocation?.name} is ${minDistance.toFixed(1)}km away. Please select pickup instead.`;

  return {
    canDeliver,
    distance: minDistance,
    message
  };
};
