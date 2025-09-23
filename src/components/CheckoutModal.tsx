import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Check, Mail, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import PayPalPayment from './PayPalPayment';

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

  // Mock saved addresses
  const savedAddresses: DeliveryAddress[] = [
    {
      id: '1',
      name: 'Home',
      street: 'Hauptstraße 123',
      city: 'Bremen',
      zipCode: '28195',
      phone: '+49 421 123 4567',
      isDefault: true
    },
    {
      id: '2',
      name: 'Work',
      street: 'Bürostraße 45',
      city: 'Bremen',
      zipCode: '28199',
      phone: '+49 421 987 6543',
      isDefault: false
    }
  ];

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
  }, [authState.user]);

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
    } catch (error) {
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
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                onClick={() => setSelectedAddress(address)}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-800 ${
                  selectedAddress?.id === address.id
                    ? 'border-red-600 bg-red-900/20'
                    : 'border-gray-700 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-white">{address.name}</span>
                      {address.isDefault && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-gray-300 mt-1">
                      {address.street}, {address.city} {address.zipCode}
                    </p>
                    <p className="text-gray-400 text-sm">{address.phone}</p>
                  </div>
                  {selectedAddress?.id === address.id && (
                    <Check className="w-6 h-6 text-red-400" />
                  )}
                </div>
              </div>
            ))}
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

          {/* Bremen Vegesack autofill button */}
          <button
            type="button"
            className="mb-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded transition-colors"
            onClick={() => setNewAddress({
              name: 'Bremen Vegesack Restaurant',
              street: 'Zum Alten Speicher 1-2',
              city: 'Bremen',
              zipCode: '28759',
              phone: '',
              instructions: ''
            })}
          >
            Use Bremen Vegesack Restaurant Location
          </button>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
        </div>
      )}

      {/* Delivery Time */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-3">Delivery Time</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="deliveryTime"
              value="asap"
              checked={deliveryTime === 'asap'}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
            />
            <span className="text-gray-300">As soon as possible (30-45 min)</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="deliveryTime"
              value="scheduled"
              checked={deliveryTime === 'scheduled'}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 focus:ring-red-500"
            />
            <span className="text-gray-300">Schedule for later</span>
          </label>
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
          <button
            onClick={() => setOrderType('delivery')}
            className={`p-4 border rounded-lg transition-all ${
              orderType === 'delivery'
                ? 'border-red-600 bg-red-900/20 text-white'
                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🚚</div>
              <div className="font-medium">Delivery</div>
              <div className="text-sm opacity-75">We'll deliver to your address</div>
              <div className="text-sm font-bold text-red-400 mt-1">+€2.00</div>
            </div>
          </button>
          <button
            onClick={() => setOrderType('pickup')}
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
            </div>
          </button>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div>
        <h4 className="text-lg font-medium text-gray-300 mb-3">Payment Method</h4>
        <div className="space-y-3">
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
          <div className="flex justify-between">
            <span className="text-gray-300">Total:</span>
            <span className="text-white font-bold">€{calculateTotal().total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Encouragement Section */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-4 border border-red-500/30">
        <h4 className="text-lg font-medium text-white mb-2">Craving Something Else?</h4>
        <p className="text-gray-300 text-sm mb-3">
          Don't forget to explore our amazing menu! We have fresh döner, crispy chicken, delicious burgers, and refreshing Fritz drinks.
        </p>
        <p className="text-red-400 text-sm font-medium">
          Try our popular items and build your favorites list!
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onClose}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium"
        >
          Browse Menu
        </button>
        <button
          onClick={() => {/* Navigate to order tracking */}}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
        >
          Track Order
        </button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderCustomerInfoStep();
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
      </div>
    </div>
  );
};

export default CheckoutModal;
