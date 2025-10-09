import React, { useState, useMemo } from 'react';
import { menuItems } from '../data/restaurants';
import MenuItemCard from './MenuItemCard';
import MenuFilters from './MenuFilters';
import MenuItemSkeleton from './MenuItemSkeleton';
import CustomizationModal from './CustomizationModal';
import { useCart } from '../context/CartContext';
import { MenuItem } from '../types';

interface MenuSectionProps {
  restaurantId: string;
  isLoading?: boolean;
}

const MenuSection: React.FC<MenuSectionProps> = ({ restaurantId, isLoading = false }) => {
  console.log('🚨 MenuSection rendered with restaurantId:', restaurantId);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [animateItems, setAnimateItems] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<MenuItem | null>(null);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const { addToCart } = useCart();

  const restaurantMenuItems = menuItems.filter(item => item.restaurantId === restaurantId);

  // Trigger animations when component mounts or when restaurant changes
  React.useEffect(() => {
    setAnimateItems(false);
    const timer = setTimeout(() => setAnimateItems(true), 100);
    return () => clearTimeout(timer);
  }, [restaurantId]);

  React.useEffect(() => {
    // Reset filters and search query when language changes
    setSelectedCategory('all');
    setDietaryFilters([]);
    setSearchQuery('');
  }, [/* Add language context or prop here to trigger on language change */]);


  const handleCustomizeClick = (item: MenuItem) => {
    setSelectedItemForCustomization(item);
    setIsCustomizationModalOpen(true);
  };


  const handleCloseCustomizationModal = () => {
    setIsCustomizationModalOpen(false);
    setSelectedItemForCustomization(null);
  };

  const handleAddToCartWithCustomizations = (customizations: unknown[], quantity: number) => {
    if (selectedItemForCustomization) {
      addToCart(selectedItemForCustomization, customizations, quantity);
      handleCloseCustomizationModal();
    }
  };

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(restaurantMenuItems.map(item => item.category))];
    return cats;
  }, [restaurantMenuItems]);

  const filteredItems = useMemo(() => {
    let filtered = restaurantMenuItems;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Dietary filters
    if (dietaryFilters.length > 0) {
      filtered = filtered.filter(item => {
        return dietaryFilters.every(filter => {
          switch (filter) {
            case 'vegetarian':
              return item.dietaryInfo.vegetarian;
            case 'vegan':
              return item.dietaryInfo.vegan;
            case 'glutenFree':
              return item.dietaryInfo.glutenFree;
            case 'spicy':
              return item.dietaryInfo.spicy > 0;
            default:
              return true;
          }
        });
      });
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [restaurantMenuItems, selectedCategory, dietaryFilters, searchQuery]);


  // Menu items are always available - delivery validation happens during checkout
  if (restaurantMenuItems.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No menu items available for this restaurant.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            {restaurantId === 'doner' && 'Mr.Happy Doner Menu'}
            {restaurantId === 'burger' && 'Mr.Happy Burger Menu'}
            {restaurantId === 'restaurant' && 'Mr.Happy Restaurant Menu'}
          </h2>
          <p className="text-xl text-gray-400">
            Discover our carefully crafted dishes and customize them to your taste
          </p>
        </div>



        {/* Filters */}
        <MenuFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          dietaryFilters={dietaryFilters}
          onDietaryFiltersChange={setDietaryFilters}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <MenuItemSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`transform transition-all duration-500 ${
                  animateItems 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="h-full flex flex-col">
                  <MenuItemCard
                    item={item}
                    onCustomizeClick={handleCustomizeClick}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No items match your current filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setDietaryFilters([]);
                setSearchQuery('');
              }}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Customization Modal */}
        {isCustomizationModalOpen && selectedItemForCustomization && (
          <CustomizationModal
            item={selectedItemForCustomization}
            isOpen={isCustomizationModalOpen}
            onClose={handleCloseCustomizationModal}
            onAddToCart={handleAddToCartWithCustomizations}
          />
        )}
      </div>
    </div>
  );
};

export default MenuSection;

