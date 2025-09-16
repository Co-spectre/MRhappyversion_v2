import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  profileComplete: boolean;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; accessToken: string } }
  | { type: 'LOGIN_FAILURE'; payload?: { error?: string; requiresEmailVerification?: boolean; userEmail?: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<AuthUser> }
  | { type: 'SET_PROFILE_COMPLETE'; payload: boolean };

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  checkProfileComplete: () => boolean;
  isEmailVerified: () => boolean;
  resendVerificationEmail: () => Promise<void>;
  refreshUserData: () => Promise<void>;
} | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isLoading: false,
        isAuthenticated: true,
        profileComplete: checkUserProfileComplete(action.payload.user)
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
        profileComplete: false
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        isLoading: false,
        isAuthenticated: false,
        profileComplete: false
      };
    
    case 'UPDATE_USER':
      const updatedUser = state.user ? { ...state.user, ...action.payload } : null;
      return {
        ...state,
        user: updatedUser,
        profileComplete: updatedUser ? checkUserProfileComplete(updatedUser) : false
      };
    
    case 'SET_PROFILE_COMPLETE':
      return {
        ...state,
        profileComplete: action.payload
      };
    
    default:
      return state;
  }
};

// Helper function to check if user profile is complete
const checkUserProfileComplete = (user: AuthUser): boolean => {
  return !!(
    user.name &&
    user.email &&
    user.phone &&
    user.addresses &&
    user.addresses.length > 0 &&
    user.addresses.some(addr => addr.street && addr.city && addr.zipCode)
  );
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    accessToken: null,
    profileComplete: false
  });

  useEffect(() => {
    // Check for stored auth data on app load
    const storedUser = localStorage.getItem('mr-happy-user');
    const storedToken = localStorage.getItem('mr-happy-token');
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken: storedToken } });
      } catch (error) {
        localStorage.removeItem('mr-happy-user');
        localStorage.removeItem('mr-happy-token');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for refresh token
        body: JSON.stringify({ email, password, rememberMe: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific email verification error
        if (data.requiresEmailVerification) {
          dispatch({ 
            type: 'LOGIN_FAILURE', 
            payload: {
              error: data.message,
              requiresEmailVerification: true,
              userEmail: data.email
            }
          });
          return false;
        }
        
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        const { user, tokens } = data;
        
        // Store user and token
        localStorage.setItem('mr-happy-user', JSON.stringify(user));
        localStorage.setItem('mr-happy-token', tokens.accessToken);
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken: tokens.accessToken } });
        return true;
      }
      
      throw new Error('Login failed');
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const register = async (email: string, _password: string, name: string, phone?: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: AuthUser = {
        id: Date.now().toString(),
        email,
        name,
        phone,
        addresses: [],
        favoriteItems: [],
        loyaltyPoints: 0,
        createdAt: new Date()
      };
      
      const accessToken = `fake-jwt-token-${Date.now()}`;
      localStorage.setItem('mr-happy-user', JSON.stringify(user));
      localStorage.setItem('mr-happy-token', accessToken);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken } });
      return true;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('mr-happy-user');
    localStorage.removeItem('mr-happy-token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem('mr-happy-user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_USER', payload: updates });
    }
  };

  const checkProfileComplete = (): boolean => {
    return state.profileComplete;
  };

  const isEmailVerified = (): boolean => {
    // In a real implementation, this would check user.isEmailVerified
    return state.user ? true : false; // For demo purposes, assume verified
  };

  const resendVerificationEmail = async (): Promise<void> => {
    if (!state.user?.email) {
      throw new Error('No user email found');
    }

    try {
      // Simulate API call to resend verification email
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      console.log('Verification email sent to:', state.user.email);
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (!state.accessToken) {
      throw new Error('No access token found');
    }

    try {
      // Simulate API call to refresh user data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // For demo purposes, assume user data is refreshed
      if (state.user) {
        dispatch({ type: 'UPDATE_USER', payload: state.user });
        
        // Update profile completion status
        const complete = checkUserProfileComplete(state.user);
        dispatch({ type: 'SET_PROFILE_COMPLETE', payload: complete });
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      state,
      dispatch,
      login,
      register,
      logout,
      updateProfile,
      checkProfileComplete,
      isEmailVerified,
      resendVerificationEmail,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};