import React, { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from './NotificationSystem';

interface EmailVerificationBannerProps {
  isVisible: boolean;
  onClose: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ isVisible, onClose }) => {
  const { state, resendVerificationEmail } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [isResending, setIsResending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldownTime > 0) {
      timer = setTimeout(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const handleResendEmail = async () => {
    if (cooldownTime > 0) return;

    setIsResending(true);
    try {
      await resendVerificationEmail();
      showSuccess(
        'Verification Email Sent',
        'Please check your inbox and spam folder for the verification link.'
      );
      setCooldownTime(60); // 60 second cooldown
    } catch (error) {
      showError(
        'Failed to Send Email',
        'Please try again later or contact support if the problem persists.'
      );
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible || !state.isAuthenticated || state.user?.emailVerified) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-900/80 to-red-900/80 border-l-4 border-orange-500 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
            <Mail className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-orange-200">Email Verification Required</h3>
            <p className="text-xs text-orange-300 mt-1">
              Please verify your email address to access all features and place orders.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleResendEmail}
            disabled={isResending || cooldownTime > 0}
            className="flex items-center space-x-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Sending...</span>
              </>
            ) : cooldownTime > 0 ? (
              <>
                <Clock className="w-3 h-3" />
                <span>Resend in {cooldownTime}s</span>
              </>
            ) : (
              <>
                <Mail className="w-3 h-3" />
                <span>Resend Email</span>
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="text-orange-300 hover:text-orange-200 transition-colors"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({ isOpen, onClose }) => {
  const { state, resendVerificationEmail, refreshUserData } = useAuth();
  const { showSuccess, showError } = useNotifications();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldownTime > 0) {
      timer = setTimeout(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  useEffect(() => {
    // Auto-check verification status every 30 seconds when modal is open
    let interval: ReturnType<typeof setInterval>;
    if (isOpen && state.isAuthenticated && !state.user?.emailVerified) {
      interval = setInterval(async () => {
        await refreshUserData();
      if (state.user?.emailVerified) {
          showSuccess(
            'Email Verified!',
            'Your email has been successfully verified. You can now access all features.'
          );
          onClose();
        }
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [isOpen, state.isAuthenticated, state.user?.emailVerified, refreshUserData, showSuccess, onClose]);

  const handleResendEmail = async () => {
    if (cooldownTime > 0) return;

    setIsResending(true);
    try {
      await resendVerificationEmail();
      showSuccess(
        'Verification Email Sent',
        'A new verification email has been sent. Please check your inbox and spam folder.'
      );
      setCooldownTime(60);
    } catch (error) {
      showError(
        'Failed to Send Email',
        'There was an error sending the verification email. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await refreshUserData();
      if (state.user?.emailVerified) {
        showSuccess(
          'Email Verified!',
          'Your email has been successfully verified.'
        );
        onClose();
      } else {
        showError(
          'Not Verified Yet',
          'Your email is still not verified. Please check your inbox or try resending the email.'
        );
      }
    } catch (error) {
      showError(
        'Check Failed',
        'Unable to check verification status. Please try again.'
      );
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 shadow-xl rounded-2xl border border-gray-800">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
            <p className="text-gray-400 mb-6">
              We've sent a verification link to <span className="text-white font-semibold">{state.user?.email}</span>. 
              Click the link in the email to verify your account.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-orange-400" />
              Instructions
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Check your inbox for an email from Mr.Happy
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                If you don't see it, check your spam or junk folder
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Click the verification link in the email
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Return here and click "Check Status" or wait for automatic verification
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Check Status</span>
                </>
              )}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={isResending || cooldownTime > 0}
              className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : cooldownTime > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Resend in {cooldownTime}s</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>Resend Email</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-gray-500 mt-4">
            Still having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export { EmailVerificationBanner, EmailVerificationModal };
