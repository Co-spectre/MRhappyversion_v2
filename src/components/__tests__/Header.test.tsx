import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

// Mock the contexts
const mockUseCart = {
  getTotalItems: jest.fn(() => 2),
  getTotalPrice: jest.fn(() => 25.99),
  dispatch: jest.fn(),
};

jest.mock('../../context/CartContext', () => ({
  useCart: () => mockUseCart,
}));

const mockUseAuth = {
  state: {
    isAuthenticated: false,
    user: null,
  },
  logout: jest.fn(),
};

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth,
}));

const mockUseLanguage = {
  language: 'en',
  setLanguage: jest.fn(),
  t: (key: string) => key, // Simple mock that returns the key
  Language: {
    EN: 'en',
    DE: 'de',
    TR: 'tr',
  },
});

jest.mock('../../context/LanguageContext', () => ({
  useLanguage: () => mockUseLanguage,
}));

// Mock the LoginModal component
jest.mock('../LoginModal', () => {
  return function MockLoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return isOpen ? React.createElement('div', { 'data-testid': 'login-modal' }, 'Login Modal') : null;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ShoppingCart: () => React.createElement('div', { 'data-testid': 'shopping-cart-icon' }),
  Menu: () => React.createElement('div', { 'data-testid': 'menu-icon' }),
  X: () => React.createElement('div', { 'data-testid': 'x-icon' }),
  User: () => React.createElement('div', { 'data-testid': 'user-icon' }),
  Search: () => React.createElement('div', { 'data-testid': 'search-icon' }),
  LogOut: () => React.createElement('div', { 'data-testid': 'logout-icon' }),
  History: () => React.createElement('div', { 'data-testid': 'history-icon' }),
  Heart: () => React.createElement('div', { 'data-testid': 'heart-icon' }),
  Languages: () => React.createElement('div', { 'data-testid': 'languages-icon' }),
  Shield: () => React.createElement('div', { 'data-testid': 'shield-icon' }),
  UtensilsCrossed: () => React.createElement('div', { 'data-testid': 'utensils-crossed-icon' }),
  Beef: () => React.createElement('div', { 'data-testid': 'beef-icon' }),
  ChefHat: () => React.createElement('div', { 'data-testid': 'chef-hat-icon' }),
}));

describe('Header', () => {
  const defaultProps = {
    currentRestaurant: 'doner',
    onRestaurantChange: jest.fn(),
    currentView: 'home',
    onViewChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the logo correctly', () => {
    render(React.createElement(Header, defaultProps));
    expect(screen.getByText('Mr.Happy')).toBeInTheDocument();
  });

  it('displays navigation items', () => {
    render(React.createElement(Header, defaultProps));
    expect(screen.getByText('nav.home')).toBeInTheDocument();
    expect(screen.getByText('nav.menu')).toBeInTheDocument();
    expect(screen.getByText('nav.about')).toBeInTheDocument();
    expect(screen.getByText('nav.jobs')).toBeInTheDocument();
  });

  it('shows cart with item count', () => {
    render(React.createElement(Header, defaultProps));
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('opens login modal when user icon is clicked and not authenticated', () => {
    render(React.createElement(Header, defaultProps));
    const userButton = screen.getByTestId('user-icon').closest('button');
    fireEvent.click(userButton!);
    expect(screen.getByTestId('login-modal')).toBeInTheDocument();
  });

  it('calls onViewChange when navigation items are clicked', () => {
    render(React.createElement(Header, defaultProps));
    const homeButton = screen.getByText('nav.home');
    fireEvent.click(homeButton);
    expect(defaultProps.onViewChange).toHaveBeenCalledWith('home');
  });

  it('shows restaurant options when on menu page', () => {
    render(React.createElement(Header, { ...defaultProps, currentView: 'menu' }));
    expect(screen.getByText('Doner')).toBeInTheDocument();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
  });

  it('calls onRestaurantChange when restaurant is selected', () => {
    render(React.createElement(Header, { ...defaultProps, currentView: 'menu' }));
    const burgerButton = screen.getByText('Burger');
    fireEvent.click(burgerButton);
    expect(defaultProps.onRestaurantChange).toHaveBeenCalledWith('burger');
  });
});
