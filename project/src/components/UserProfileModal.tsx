import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { X, User, Mail, Phone, MapPin, Plus, Edit3, Trash2, Check, Save, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthUser, Address } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  [key: string]: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { state, updateProfile, checkProfileComplete } = useAuth();
  const { requestLocation, isLocationLoading, locationError, location, isLocationEnabled } = useLocation();
  const [activeTab, setActiveTab] = useState<'personal' | 'addresses' | 'preferences'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    zipCode: '',
    isDefault: false
  });

  const [preferences, setPreferences] = useState({
    marketingConsent: false,
    notifications: true,
    dietaryPreferences: [] as string[],
    allergens: [] as string[]
  });

  // Initialize form data when user data changes
  useEffect(() => {
    if (state.user) {
      const nameParts = state.user.name.split(' ');
      setPersonalInfo({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: state.user.email,
        phone: state.user.phone || ''
      });
    }
  }, [state.user]);

  const validatePersonalInfo = (): boolean => {
    const newErrors: FormErrors = {};

    if (!personalInfo.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!personalInfo.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!personalInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!personalInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{10,20}$/.test(personalInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAddress = (): boolean => {
    const newErrors: FormErrors = {};

    if (!newAddress.name.trim()) {
      newErrors.addressName = 'Address name is required';
    }
    if (!newAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!newAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!newAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePersonalInfo = async () => {
    if (!validatePersonalInfo()) return;

    setIsLoading(true);
    try {
      const fullName = `${personalInfo.firstName.trim()} ${personalInfo.lastName.trim()}`;
      const updates: Partial<AuthUser> = {
        name: fullName,
        email: personalInfo.email,
        phone: personalInfo.phone
      };

      updateProfile(updates);
      setIsEditing(false);
    } catch (error) {
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (!validateAddress()) return;

    const address: Address = {
      id: Date.now().toString(),
      name: newAddress.name,
      street: newAddress.street,
      city: newAddress.city,
      state: '', // You might want to add this field
      zipCode: newAddress.zipCode,
      isDefault: newAddress.isDefault || (state.user?.addresses?.length === 0)
    };

    // Update user addresses
    const currentAddresses = state.user?.addresses || [];
    
    // If this is set as default, make all others non-default
    const updatedAddresses = newAddress.isDefault 
      ? currentAddresses.map(addr => ({ ...addr, isDefault: false })).concat(address)
      : currentAddresses.concat(address);

    updateProfile({ addresses: updatedAddresses });

    // Reset form
    setNewAddress({
      name: '',
      street: '',
      city: '',
      zipCode: '',
      isDefault: false
    });
    setShowAddAddress(false);
    setErrors({});
  };

  const handleRemoveAddress = (addressId: string) => {
    const currentAddresses = state.user?.addresses || [];
    const updatedAddresses = currentAddresses.filter(addr => addr.id !== addressId);
    updateProfile({ addresses: updatedAddresses });
  };

  // Location feedback state
  const [locationMsg, setLocationMsg] = useState<string | null>(null);

  const handleSetCurrentLocation = async () => {
    setLocationMsg(null);
    try {
      await requestLocation();
      setLocationMsg('Location set successfully!');
    } catch (e) {
      setLocationMsg('Failed to set location.');
    }
  };

  const renderPersonalInfoTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Personal Information</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

  {/* Profile Completion Status */}
      <div className={`p-4 rounded-lg border ${
        checkProfileComplete() 
          ? 'bg-green-900/20 border-green-600' 
          : 'bg-orange-900/20 border-orange-600'
      }`}>
        <div className="flex items-center space-x-3">
          {checkProfileComplete() ? (
            <Check className="w-6 h-6 text-green-400" />
          ) : (
            <AlertCircle className="w-6 h-6 text-orange-400" />
          )}
          <div>
            <h4 className={`font-medium ${
              checkProfileComplete() ? 'text-green-400' : 'text-orange-400'
            }`}>
              Profile {checkProfileComplete() ? 'Complete' : 'Incomplete'}
            </h4>
            <p className="text-gray-300 text-sm">
              {checkProfileComplete() 
                ? 'Your profile is complete and ready for ordering.'
                : 'Please complete your profile to place orders easily.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Set Current Location Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleSetCurrentLocation}
          disabled={isLocationLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-700 disabled:text-gray-400"
        >
          {isLocationLoading ? 'Setting Location...' : 'Set Current Location'}
        </button>
        {isLocationEnabled && location && (
          <span className="text-green-400 text-sm">Location set!</span>
        )}
        {locationMsg && (
          <span className="text-yellow-400 text-sm">{locationMsg}</span>
        )}
        {locationError && (
          <span className="text-red-400 text-sm">{locationError}</span>
        )}
      </div>

      {errors.general && (
        <div className="p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-400 text-sm">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={personalInfo.firstName}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
            disabled={!isEditing}
            className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-800 disabled:text-gray-400 ${
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
            value={personalInfo.lastName}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
            disabled={!isEditing}
            className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-800 disabled:text-gray-400 ${
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
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
            disabled={!isEditing}
            className={`w-full pl-10 pr-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-800 disabled:text-gray-400 ${
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
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
            disabled={!isEditing}
            className={`w-full pl-10 pr-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-800 disabled:text-gray-400 ${
              errors.phone ? 'border-red-600' : 'border-gray-700'
            }`}
            placeholder="+49 123 456 7890"
          />
        </div>
        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
      </div>

      {isEditing && (
        <div className="flex space-x-4">
          <button
            onClick={handleSavePersonalInfo}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  const renderAddressesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Delivery Addresses</h3>
        <button
          onClick={() => setShowAddAddress(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Existing Addresses */}
      <div className="space-y-4">
        {state.user?.addresses?.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p>No addresses saved yet</p>
            <p className="text-sm">Add an address to make ordering easier</p>
          </div>
        )}

        {state.user?.addresses?.map((address) => (
          <div
            key={address.id}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-white">{address.name}</span>
                  {address.isDefault && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-gray-300">
                  {address.street}
                </p>
                <p className="text-gray-300">
                  {address.city}, {address.zipCode}
                </p>
              </div>
              <button
                onClick={() => handleRemoveAddress(address.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Address Form */}
      {showAddAddress && (
        <div className="p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="text-lg font-medium text-white mb-4">Add New Address</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address Name *
              </label>
              <input
                type="text"
                value={newAddress.name}
                onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  errors.addressName ? 'border-red-600' : 'border-gray-700'
                }`}
                placeholder="Home, Work, etc."
              />
              {errors.addressName && <p className="text-red-400 text-sm mt-1">{errors.addressName}</p>}
            </div>

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

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
              />
              <label htmlFor="isDefault" className="text-gray-300">
                Set as default address
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddAddress}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
              <button
                onClick={() => {
                  setShowAddAddress(false);
                  setNewAddress({ name: '', street: '', city: '', zipCode: '', isDefault: false });
                  setErrors({});
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Preferences & Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div>
            <h4 className="text-white font-medium">Marketing Communications</h4>
            <p className="text-gray-400 text-sm">Receive offers and promotions via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.marketingConsent}
              onChange={(e) => setPreferences(prev => ({ ...prev, marketingConsent: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div>
            <h4 className="text-white font-medium">Push Notifications</h4>
            <p className="text-gray-400 text-sm">Get notified about order updates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

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
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">User Profile</h2>
                <p className="text-gray-400">Manage your account settings</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
            {[
              { id: 'personal', label: 'Personal Info', icon: <User className="w-4 h-4" /> },
              { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" /> },
              { id: 'preferences', label: 'Preferences', icon: <User className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'personal' && renderPersonalInfoTab()}
            {activeTab === 'addresses' && renderAddressesTab()}
            {activeTab === 'preferences' && renderPreferencesTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
