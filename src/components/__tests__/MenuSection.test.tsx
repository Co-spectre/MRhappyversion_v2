import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as MenuSectionModule from '../MenuSection';

const MenuSection = MenuSectionModule.default || MenuSectionModule;

// Mock the contexts
const mockUseCart = {
  addToCart: jest.fn(),
};

jest.mock('../../context/CartContext', () => ({
  useCart: () => mockUseCart,
}));

// Mock the data
jest.mock('../../data/restaurants', () => ({
  menuItems: [
    {
      id: '1',
      name: 'Test Item 1',
      description: 'Test description 1',
      price: 10.99,
      category: 'main',
      restaurantId: 'doner',
      dietaryInfo: {
        vegetarian: true,
        vegan: false,
        glutenFree: true,
        spicy: 0,
      },
      ingredients: ['ing1', 'ing2'],
    },
    {
      id: '2',
      name: 'Test Item 2',
      description: 'Test description 2',
      price: 12.99,
      category: 'sides',
      restaurantId: 'doner',
      dietaryInfo: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        spicy: 2,
      },
      ingredients: ['ing3'],
    },
  ],
  ingredients: [
    { id: 'ing1', name: 'Ingredient 1', price: 1.0 },
    { id: 'ing2', name: 'Ingredient 2', price: 1.5 },
    { id: 'ing3', name: 'Ingredient 3', price: 2.0 },
  ],
}));

// Mock child components
jest.mock('../MenuItemCard', () => {
  return function MockMenuItemCard({ item, onCustomizeClick }: any) {
    return React.createElement('div', {
      'data-testid': `menu-item-${item.id}`,
      onClick: () => onCustomizeClick(item),
    }, item.name);
  };
});

jest.mock('../MenuFilters', () => {
  return function MockMenuFilters({
    categories,
    selectedCategory,
    onCategoryChange,
    dietaryFilters,
    onDietaryFiltersChange,
    searchQuery,
    onSearchChange,
  }: any) {
    return React.createElement('div', { 'data-testid': 'menu-filters' },
      React.createElement('button', {
        'data-testid': 'category-all',
        onClick: () => onCategoryChange('all'),
      }, 'All'),
      React.createElement('button', {
        'data-testid': 'category-main',
        onClick: () => onCategoryChange('main'),
      }, 'Main'),
      React.createElement('input', {
        'data-testid': 'search-input',
        value: searchQuery,
        onChange: (e: any) => onSearchChange(e.target.value),
      })
    );
  };
});

jest.mock('../MenuItemSkeleton', () => {
  return function MockMenuItemSkeleton() {
    return React.createElement('div', { 'data-testid': 'menu-item-skeleton' });
  };
});

jest.mock('../CustomizationModal', () => {
  return function MockCustomizationModal({ isOpen, onClose, onAddToCart }: any) {
    if (!isOpen) return null;
    return React.createElement('div', { 'data-testid': 'customization-modal' },
      React.createElement('button', {
        'data-testid': 'close-modal',
        onClick: onClose,
      }, 'Close'),
      React.createElement('button', {
        'data-testid': 'add-to-cart',
        onClick: () => onAddToCart([], 1),
      }, 'Add to Cart')
    );
  };
});

describe('MenuSection', () => {
  const defaultProps = {
    restaurantId: 'doner',
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the menu header correctly', () => {
    render(React.createElement(MenuSection, defaultProps));
    expect(screen.getByText('Mr.Happy Doner Menu')).toBeInTheDocument();
  });

  it('displays menu items', () => {
    render(React.createElement(MenuSection, defaultProps));
    expect(screen.getByTestId('menu-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-2')).toBeInTheDocument();
  });

  it('shows loading skeletons when loading', () => {
    render(React.createElement(MenuSection, { ...defaultProps, isLoading: true }));
    expect(screen.getAllByTestId('menu-item-skeleton')).toHaveLength(6);
  });

  it('filters items by category', () => {
    render(React.createElement(MenuSection, defaultProps));
    const mainCategoryButton = screen.getByTestId('category-main');
    fireEvent.click(mainCategoryButton);

    expect(screen.getByTestId('menu-item-1')).toBeInTheDocument();
    expect(screen.queryByTestId('menu-item-2')).not.toBeInTheDocument();
  });

  it('filters items by search query', () => {
    render(React.createElement(MenuSection, defaultProps));
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Test Item 1' } });

    expect(screen.getByTestId('menu-item-1')).toBeInTheDocument();
    expect(screen.queryByTestId('menu-item-2')).not.toBeInTheDocument();
  });

  it('opens customization modal when item is clicked', () => {
    render(React.createElement(MenuSection, defaultProps));
    const menuItem = screen.getByTestId('menu-item-1');
    fireEvent.click(menuItem);

    expect(screen.getByTestId('customization-modal')).toBeInTheDocument();
  });

  it('closes customization modal', () => {
    render(React.createElement(MenuSection, defaultProps));
    const menuItem = screen.getByTestId('menu-item-1');
    fireEvent.click(menuItem);

    const closeButton = screen.getByTestId('close-modal');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('customization-modal')).not.toBeInTheDocument();
  });

  it('adds item to cart with customizations', () => {
    render(React.createElement(MenuSection, defaultProps));
    const menuItem = screen.getByTestId('menu-item-1');
    fireEvent.click(menuItem);

    const addToCartButton = screen.getByTestId('add-to-cart');
    fireEvent.click(addToCartButton);

    expect(mockUseCart.addToCart).toHaveBeenCalled();
  });

  it('shows no items message when no menu items available', () => {
    // Mock empty menu items for this test
    const originalMenuItems = require('../../data/restaurants').menuItems;
    require('../../data/restaurants').menuItems = [];

    render(React.createElement(MenuSection, defaultProps));
    expect(screen.getByText('No menu items available for this restaurant.')).toBeInTheDocument();

    // Restore original menu items
    require('../../data/restaurants').menuItems = originalMenuItems;
  });

  it('shows no items match filters message', () => {
    render(React.createElement(MenuSection, defaultProps));
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'nonexistent item' } });

    expect(screen.getByText('No items match your current filters.')).toBeInTheDocument();
  });

  it('clears filters when clear filters button is clicked', () => {
    render(React.createElement(MenuSection, defaultProps));
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'nonexistent item' } });

    const clearFiltersButton = screen.getByText('Clear Filters');
    fireEvent.click(clearFiltersButton);

    expect(screen.getByTestId('menu-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-2')).toBeInTheDocument();
  });
});
