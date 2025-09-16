import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface EnhancedRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

interface PasswordRequirement {
  met: boolean;
  text: string;
}

const EnhancedRegistrationModal: React.FC<EnhancedRegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot'>(initialMode);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    termsAccepted: false,
    privacyAccepted: false,
    marketingConsent: false
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [step, setStep] = useState(1);

  const { login, register } = useAuth();

  // Password strength requirements
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { met: false, text: 'At least 8 characters' },
    { met: false, text: 'One uppercase letter' },
    { met: false, text: 'One lowercase letter' },
    { met: false, text: 'One number' },
    { met: false, text: 'One special character (!@#$%^&*)' }
  ]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setStep(1);
      setErrors({});
      setVerificationSent(false);
      setCaptchaVerified(false);
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        termsAccepted: false,
        privacyAccepted: false,
        marketingConsent: false
      });
    }
  }, [isOpen, initialMode]);

  // Password strength validation
  useEffect(() => {
    const password = formData.password;
    setPasswordRequirements([
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
      { met: /[a-z]/.test(password), text: 'One lowercase letter' },
      { met: /\d/.test(password), text: 'One number' },
      { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'One special character (!@#$%^&*)' }
    ]);
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,20}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'register') {
      const unmetRequirements = passwordRequirements.filter(req => !req.met);
      if (unmetRequirements.length > 0) {
        newErrors.password = 'Password does not meet requirements';
      }
    }

    if (mode === 'register') {
      // First name validation
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      } else if (formData.firstName.trim().length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      }

      // Last name validation
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      } else if (formData.lastName.trim().length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
      }

      // Phone validation
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      // Terms and privacy validation
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = 'You must accept the terms of service';
      }

      if (!formData.privacyAccepted) {
        newErrors.privacyAccepted = 'You must accept the privacy policy';
      }

      // CAPTCHA validation (simulated)
      if (!captchaVerified) {
        newErrors.captcha = 'Please complete the CAPTCHA verification';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        const success = await login(formData.email, formData.password);
        if (success) {
          onClose();
        } else {
          setErrors({ general: 'Invalid email or password' });
        }
      } else if (mode === 'register') {
        if (step === 1) {
          // Move to verification step
          setStep(2);
          setMode('verify');
          setVerificationSent(true);
          // In real implementation, send verification email here
        } else {
          const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
          const success = await register(formData.email, formData.password, fullName);
          if (success) {
            onClose();
          } else {
            setErrors({ general: 'Registration failed. Please try again.' });
          }
        }
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaComplete = () => {
    setCaptchaVerified(true);
    if (errors.captcha) {
      setErrors(prev => ({ ...prev, captcha: '' }));
    }
  };

  const renderPasswordStrength = () => {
    if (mode !== 'register' || !formData.password) return null;

    const metRequirements = passwordRequirements.filter(req => req.met).length;
    const strength = metRequirements / passwordRequirements.length;
    
    let strengthColor = 'bg-red-500';
    let strengthText = 'Weak';
    
    if (strength >= 0.8) {
      strengthColor = 'bg-green-500';
      strengthText = 'Strong';
    } else if (strength >= 0.6) {
      strengthColor = 'bg-yellow-500';
      strengthText = 'Medium';
    } else if (strength >= 0.4) {
      strengthColor = 'bg-orange-500';
      strengthText = 'Fair';
    }

    return (
      <div className="mt-2">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Password Strength:</span>
          <span className={`text-sm font-medium ${
            strength >= 0.8 ? 'text-green-400' : 
            strength >= 0.6 ? 'text-yellow-400' : 
            strength >= 0.4 ? 'text-orange-400' : 'text-red-400'
          }`}>
            {strengthText}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
        <div className="space-y-1">
          {passwordRequirements.map((req, index) => (
            <div key={index} className="flex items-center space-x-2">
              {req.met ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <X className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${req.met ? 'text-green-400' : 'text-gray-400'}`}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCaptcha = () => {
    if (mode !== 'register') return null;

    return (
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Security Verification
        </label>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          {!captchaVerified ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-gray-400 rounded"></div>
                <span className="text-gray-300">I'm not a robot</span>
              </div>
              <button
                type="button"
                onClick={handleCaptchaComplete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              >
                Verify
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 text-green-400">
              <Check className="w-6 h-6" />
              <span>Verification complete</span>
            </div>
          )}
          {errors.captcha && (
            <p className="text-red-400 text-sm mt-2">{errors.captcha}</p>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 shadow-xl rounded-2xl border border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Welcome Back' : 
                 mode === 'register' ? 'Create Account' :
                 mode === 'verify' ? 'Verify Email' : 'Reset Password'}
              </h3>
              <p className="text-gray-400 mt-1">
                {mode === 'login' ? 'Sign in to your Mr.Happy account' :
                 mode === 'register' ? 'Join the Mr.Happy family' :
                 mode === 'verify' ? 'Check your email for verification' :
                 'Reset your password'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Verification sent message */}
          {mode === 'verify' && verificationSent && (
            <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
              <div className="flex items-center space-x-3">
                <Check className="w-6 h-6 text-green-400" />
                <div>
                  <h4 className="text-green-400 font-medium">Verification Email Sent!</h4>
                  <p className="text-green-300 text-sm mt-1">
                    We've sent a verification link to {formData.email}. Please check your email and click the link to verify your account.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => setMode('login')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                >
                  Continue to Login
                </button>
                <button
                  onClick={() => {/* Resend verification */}}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  Resend Email
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          {mode !== 'verify' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-400 text-sm">
                  {errors.general}
                </div>
              )}

              {/* Name fields for registration */}
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                          errors.firstName ? 'border-red-600' : 'border-gray-700'
                        }`}
                        placeholder="First name"
                      />
                    </div>
                    {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                          errors.lastName ? 'border-red-600' : 'border-gray-700'
                        }`}
                        placeholder="Last name"
                      />
                    </div>
                    {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                      errors.email ? 'border-red-600' : 'border-gray-700'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone for registration */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                        errors.phone ? 'border-red-600' : 'border-gray-700'
                      }`}
                      placeholder="+49 123 456 7890"
                    />
                  </div>
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                      errors.password ? 'border-red-600' : 'border-gray-700'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
                {renderPasswordStrength()}
              </div>

              {/* Confirm Password for registration */}
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 ${
                        errors.confirmPassword ? 'border-red-600' : 'border-gray-700'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {/* CAPTCHA for registration */}
              {renderCaptcha()}

              {/* Terms and Privacy for registration */}
              {mode === 'register' && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="termsAccepted" className="text-sm text-gray-300">
                      I accept the{' '}
                      <a href="#" className="text-red-400 hover:text-red-300 underline">
                        Terms of Service
                      </a>{' '}
                      *
                    </label>
                  </div>
                  {errors.termsAccepted && <p className="text-red-400 text-sm">{errors.termsAccepted}</p>}

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="privacyAccepted"
                      id="privacyAccepted"
                      checked={formData.privacyAccepted}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="privacyAccepted" className="text-sm text-gray-300">
                      I accept the{' '}
                      <a href="#" className="text-red-400 hover:text-red-300 underline">
                        Privacy Policy
                      </a>{' '}
                      *
                    </label>
                  </div>
                  {errors.privacyAccepted && <p className="text-red-400 text-sm">{errors.privacyAccepted}</p>}

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="marketingConsent"
                      id="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="marketingConsent" className="text-sm text-gray-300">
                      I would like to receive marketing communications and special offers (optional)
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-600/25 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>
          )}

          {/* Toggle between login/register */}
          {mode !== 'verify' && (
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setErrors({});
                    setStep(1);
                  }}
                  className="ml-2 text-red-600 hover:text-red-500 font-medium transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
              {mode === 'login' && (
                <button
                  onClick={() => setMode('forgot')}
                  className="mt-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Forgot your password?
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedRegistrationModal;
