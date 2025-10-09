import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthUser }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<AuthUser> };

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  checkProfileComplete: () => boolean;
} | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        isAuthenticated: true
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: false,
    isAuthenticated: false
  });

  useEffect(() => {
    // Check for stored auth data on app load
    const storedUser = localStorage.getItem('mr-happy-user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('mr-happy-user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo credentials for testing
      let user: AuthUser;
      
      if (email === 'admin@mrhappy.com' && password === 'admin123') {
        // Admin user
        user = {
          id: 'admin-1',
          email,
          name: 'Admin User',
          phone: '+49 555 123456',
          addresses: [],
          favoriteItems: [],
          loyaltyPoints: 0,
          createdAt: new Date('2024-12-01'),
          role: 'admin'
        };
      } else if (email === 'customer@mrhappy.com' && password === 'customer123') {
        // Demo customer
        user = {
          id: 'customer-1',
          email,
          name: 'Demo Customer',
          phone: '+49 123 456789',
          addresses: [
            {
              id: '1',
              name: 'Home',
              street: 'Hauptstraße 123',
              city: 'Bremen',
              state: 'Bremen',
              zipCode: '28195',
              isDefault: true
            }
          ],
          favoriteItems: ['burger-1', 'burger-2'],
          loyaltyPoints: 150,
          createdAt: new Date('2025-01-15'),
          role: 'customer'
        };
      } else {
        // Generic user for any other email/password combination
        user = {
          id: Date.now().toString(),
          email,
          name: email.split('@')[0],
          phone: '+49 555 000000',
          addresses: [
            {
              id: '1',
              name: 'Home',
              street: 'Beispielstraße 1',
              city: 'Bremen',
              state: 'Bremen',
              zipCode: '28199',
              isDefault: true
            }
          ],
          favoriteItems: [],
          loyaltyPoints: 0,
          createdAt: new Date(),
          role: 'customer'
        };
      }
      
      localStorage.setItem('mr-happy-user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return true;
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
        phone: phone || undefined,
        addresses: [],
        favoriteItems: [],
        loyaltyPoints: 0,
        createdAt: new Date(),
        locationVerified: false,
        emailVerified: false
      };
      
      localStorage.setItem('mr-happy-user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return true;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('mr-happy-user');
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
    if (!state.user) return false;
    
    // Check if all required profile fields are filled
    const requiredFields = ['name', 'email', 'phone'];
    return requiredFields.every(field => {
      const value = state.user![field as keyof AuthUser];
      return value && value.toString().trim().length > 0;
    });
  };

  return (
    <AuthContext.Provider value={{
      state,
      dispatch,
      login,
      register,
      logout,
      updateProfile,
      checkProfileComplete
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