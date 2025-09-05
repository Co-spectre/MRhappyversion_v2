import React from 'react';
import { Search, Filter } from 'lucide-react';

interface MenuFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  dietaryFilters: string[];
  onDietaryFiltersChange: (filters: string[]) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const MenuFilters: React.FC<MenuFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  dietaryFilters,
  onDietaryFiltersChange,
  searchQuery,
  onSearchChange
}) => {
  const dietaryOptions = [
    { key: 'vegetarian', label: 'Vegetarian', icon: '🌱' },
    { key: 'vegan', label: 'Vegan', icon: '🥗' },
    { key: 'glutenFree', label: 'Gluten Free', icon: '🌾' },
    { key: 'spicy', label: 'Spicy', icon: '🌶️' }
  ];

  const toggleDietaryFilter = (filter: string) => {
    if (dietaryFilters.includes(filter)) {
      onDietaryFiltersChange(dietaryFilters.filter(f => f !== filter));
    } else {
      onDietaryFiltersChange([...dietaryFilters, filter]);
    }
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {category === 'all' ? 'All Items' : category}
          </button>
        ))}
      </div>

      {/* Dietary Filters */}
      <div className="flex flex-wrap justify-center gap-2">
        <div className="flex items-center space-x-2 text-gray-400 mr-4">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Dietary:</span>
        </div>
        {dietaryOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => toggleDietaryFilter(option.key)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              dietaryFilters.includes(option.key)
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuFilters;