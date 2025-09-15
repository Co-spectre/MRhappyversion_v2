import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { MenuItem, Ingredient } from '../types';

interface CustomizationModalProps {
  item: MenuItem;
  availableIngredients: Ingredient[];
  onClose: () => void;
  onAddToCart: (customizations: any[], quantity: number) => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  availableIngredients,
  onClose,
  onAddToCart
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0]?.name || '');
  const [customizations, setCustomizations] = useState<{
    ingredientId: string;
    action: 'add' | 'remove' | 'extra' | 'double';
    price: number;
  }[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const ingredientCategories = useMemo(() => {
    const categories = availableIngredients.reduce((acc, ingredient) => {
      if (!acc[ingredient.category]) {
        acc[ingredient.category] = [];
      }
      acc[ingredient.category].push(ingredient);
      return acc;
    }, {} as Record<string, Ingredient[]>);
    return categories;
  }, [availableIngredients]);

  const getIngredientStatus = (ingredientId: string) => {
    const customization = customizations.find(c => c.ingredientId === ingredientId);
    
    // For mandatory customization items, start with nothing selected
    // Customers must actively choose what they want
    if (item.requiresCustomization) {
      if (!customization) {
        return false; // Nothing selected by default
      }
      return customization.action === 'add' || customization.action === 'extra' || customization.action === 'double';
    }
    
    // For regular items, show default ingredients as selected
    const isIncludedByDefault = item.ingredients.includes(ingredientId);
    if (!customization) {
      return isIncludedByDefault;
    }
    
    return customization.action === 'add' || customization.action === 'extra' || customization.action === 'double';
  };

  const toggleIngredient = (ingredientId: string) => {
    const isCurrentlySelected = getIngredientStatus(ingredientId);
    
    if (isCurrentlySelected) {
      // If currently selected, uncheck it (remove the customization)
      updateCustomization(ingredientId, 'none');
    } else {
      // If currently unselected, check it (add the ingredient)
      updateCustomization(ingredientId, 'add');
    }
  };

  const updateCustomization = (ingredientId: string, action: 'add' | 'remove' | 'extra' | 'double' | 'none') => {
    const ingredient = availableIngredients.find(i => i.id === ingredientId);
    if (!ingredient) return;

    setCustomizations(prev => {
      const filtered = prev.filter(c => c.ingredientId !== ingredientId);
      
      if (action === 'none') {
        return filtered;
      }

      // For items that require customization, make all customizations free
      const price = item.requiresCustomization ? 0 : (
        action === 'extra' ? ingredient.extraPrice : 
        action === 'double' ? ingredient.doublePrice :
        action === 'remove' ? (ingredient.isPremium ? -ingredient.basePrice : 0) :
        ingredient.basePrice
      );

      return [...filtered, { ingredientId, action, price }];
    });
  };

  const calculateTotalPrice = () => {
    let basePrice = item.basePrice;
    
    if (selectedSize && item.sizes) {
      const sizeMultiplier = item.sizes.find(s => s.name === selectedSize)?.priceMultiplier || 1;
      basePrice *= sizeMultiplier;
    }

    const customizationPrice = customizations.reduce((sum, c) => sum + c.price, 0);
    return (basePrice + customizationPrice) * quantity;
  };

  const handleAddToCart = () => {
    // For mandatory customization items, ensure at least one ingredient is selected
    if (item.requiresCustomization) {
      const allIngredients = Object.values(ingredientCategories).flat();
      const hasAnySelection = allIngredients.some(ingredient => getIngredientStatus(ingredient.id));
      if (!hasAnySelection) {
        alert('Please select at least one ingredient for your customization.');
        return;
      }
    }
    
    onAddToCart(customizations, quantity);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'protein': return '🥩';
      case 'vegetable': return '🥬';
      case 'cheese': return '🧀';
      case 'sauce': return '🥄';
      case 'topping': return '🌟';
      default: return '🔸';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/75 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-900 shadow-xl rounded-2xl border border-gray-800">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2">{item.name}</h3>
              <p className="text-gray-400">{item.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="text-2xl font-bold text-red-500">€{calculateTotalPrice().toFixed(2)}</div>
                <div className="text-sm text-gray-400 line-through">€{(calculateTotalPrice() * 1.2).toFixed(2)}</div>
                <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">SAVE 17%</div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Basic Info */}
            <div>
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
              
              {/* Size Selection */}
              {item.sizes && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Size</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {item.sizes.map((size) => (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size.name)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          selectedSize === size.name
                            ? 'border-red-600 bg-red-600/10 text-red-600'
                            : 'border-gray-700 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-medium">{size.name}</div>
                        <div className="text-sm opacity-75">
                          €{(item.basePrice * size.priceMultiplier).toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-white mb-3">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests or modifications..."
                  className="w-full p-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Right Column - Customizations */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Customize Your Order</h4>
              
              {Object.entries(ingredientCategories).map(([category, ingredients]) => (
                <div key={category} className="mb-6">
                  <h5 className="flex items-center space-x-2 text-md font-medium text-gray-300 mb-3 capitalize">
                    <span>{getCategoryIcon(category)}</span>
                    <span>{category}s</span>
                  </h5>
                  
                  <div className="space-y-2">
                    {ingredients.map((ingredient) => {
                      const isSelected = getIngredientStatus(ingredient.id);
                      
                      return (
                        <div key={ingredient.id} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-gray-800">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white">{ingredient.name}</span>
                              {ingredient.isPremium && (
                                <span className="px-2 py-1 bg-yellow-600 text-black text-xs rounded-full font-medium">
                                  Premium
                                </span>
                              )}
                            </div>
                            {ingredient.description && (
                              <p className="text-xs text-gray-400 mt-1">{ingredient.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {/* Price info - only show for non-mandatory customization items */}
                            {!item.requiresCustomization && (
                              <div className="text-right text-xs text-gray-400 mr-2">
                                {ingredient.extraPrice > 0 && <div>+€{ingredient.extraPrice.toFixed(2)}</div>}
                                {ingredient.doublePrice > 0 && <div>2x +€{ingredient.doublePrice.toFixed(2)}</div>}
                              </div>
                            )}
                            
                            {/* Checkbox */}
                            <div className="flex items-center">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleIngredient(ingredient.id)}
                                  className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-red-600 border-red-600 text-white' 
                                    : 'border-gray-600 hover:border-gray-500'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <span className="ml-3 text-sm text-gray-300">
                                  {isSelected ? 'Selected' : 'Add this'}
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
            {/* Quantity */}
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Quantity:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors w-10 h-10 flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-white font-medium px-4">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors w-10 h-10 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-600/25"
            >
              Add to Cart - €{calculateTotalPrice().toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;