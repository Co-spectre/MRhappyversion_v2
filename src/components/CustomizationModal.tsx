import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { MenuItem } from '../types';

interface CustomizationStep {
  id: string;
  title: string;
  required: boolean;
  multiSelect: boolean;
  maxSelections?: number;
  options: {
    id: string;
    name: string;
    price?: number;
    description?: string;
  }[];
}

interface CustomizationModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customizations: any[], quantity: number) => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  // Define steps based on item category
  const getCustomizationSteps = (): CustomizationStep[] => {
    if (item.category === 'Döner' || item.category === 'MENÜ\'S') {
      return [
        {
          id: 'meat',
          title: 'Choose Your Meat',
          required: true,
          multiSelect: false,
          options: [
            { id: 'chicken', name: 'Chicken', description: 'Tender grilled chicken' },
            { id: 'beef', name: 'Beef', description: 'Seasoned beef döner' },
            { id: 'mix', name: 'Mix (Chicken + Beef)', description: 'Best of both worlds' }
          ]
        },
        {
          id: 'sauces',
          title: 'Select Your Sauces',
          required: true,
          multiSelect: true,
          maxSelections: 2,
          options: [
            { id: 'cocktail', name: 'Cocktail', description: 'Creamy cocktail sauce' },
            { id: 'tzatziki', name: 'Tzatziki', description: 'Greek yogurt with herbs' },
            { id: 'curry', name: 'Curry', description: 'Spicy curry sauce' },
            { id: 'ranch', name: 'Ranch', description: 'Classic ranch dressing' },
            { id: 'garlic', name: 'Knoblauch', description: 'Garlic sauce' },
            { id: 'hot', name: 'Scharfe Sauce', description: 'Spicy hot sauce' }
          ]
        },
        {
          id: 'salad',
          title: 'Choose Your Salad',
          required: true,
          multiSelect: true,
          options: [
            { id: 'mixed', name: 'Mixed Salad', description: 'Lettuce, tomato, cucumber' },
            { id: 'fresh', name: 'Fresh Garden', description: 'Crisp vegetables and herbs' },
            { id: 'mediterranean', name: 'Mediterranean', description: 'Olives, peppers, onions' }
          ]
        },
        {
          id: 'extras',
          title: 'Add Extras (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'cheese', name: 'Extra Cheese', price: 1.5 },
            { id: 'meat_extra', name: 'Extra Meat', price: 3.0 },
            { id: 'onions', name: 'Grilled Onions', price: 1.0 },
            { id: 'jalapenos', name: 'Jalapeños', price: 1.0 }
          ]
        },
        {
          id: 'sides',
          title: 'Sides & Extra Sauces',
          required: false,
          multiSelect: true,
          options: [
            { id: 'extra_sauce', name: 'Extra Sauce Portion', price: 2.5, description: 'Additional portion of your chosen sauces' },
            { id: 'fries', name: 'Pommes', price: 4.7, description: 'Crispy golden fries' },
            { id: 'nuggets_fries', name: '6x Nuggets + Pommes', price: 8.7, description: 'Chicken nuggets with fries' },
            { id: 'onion_rings', name: 'Onion Rings', price: 3.5, description: 'Crispy breaded onion rings' },
            { id: 'mozzarella_sticks', name: 'Mozzarella Sticks', price: 5.2, description: 'Breaded mozzarella sticks (6 pieces)' },
            { id: 'chicken_wings', name: 'Chicken Wings', price: 7.5, description: 'Spicy chicken wings (8 pieces)' },
            { id: 'garlic_bread', name: 'Garlic Bread', price: 3.0, description: 'Toasted bread with garlic butter' }
          ]
        }
      ];
    } else if (item.category === 'WRAP') {
      return [
        {
          id: 'protein',
          title: 'Choose Your Protein',
          required: true,
          multiSelect: false,
          options: [
            { id: 'doner', name: 'Döner Meat', description: 'Traditional döner meat' },
            { id: 'chicken', name: 'Grilled Chicken', description: 'Tender grilled chicken' },
            { id: 'veggie', name: 'Vegetarian', description: 'Fresh vegetables with feta' }
          ]
        },
        {
          id: 'sauces',
          title: 'Select Your Sauces',
          required: true,
          multiSelect: true,
          maxSelections: 2,
          options: [
            { id: 'cocktail', name: 'Cocktail', description: 'Creamy cocktail sauce' },
            { id: 'tzatziki', name: 'Tzatziki', description: 'Greek yogurt with herbs' },
            { id: 'curry', name: 'Curry', description: 'Spicy curry sauce' },
            { id: 'garlic', name: 'Knoblauch', description: 'Garlic sauce' },
            { id: 'hot', name: 'Scharfe Sauce', description: 'Spicy hot sauce' }
          ]
        },
        {
          id: 'vegetables',
          title: 'Choose Your Vegetables',
          required: true,
          multiSelect: true,
          options: [
            { id: 'tomato', name: 'Tomatoes', description: 'Fresh sliced tomatoes' },
            { id: 'onions', name: 'Red Onions', description: 'Crisp red onions' },
            { id: 'lettuce', name: 'Lettuce', description: 'Fresh green lettuce' },
            { id: 'cucumber', name: 'Cucumber', description: 'Fresh cucumber slices' },
            { id: 'peppers', name: 'Bell Peppers', description: 'Colorful bell peppers' }
          ]
        },
        {
          id: 'extras',
          title: 'Add Extras (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'cheese', name: 'Extra Cheese', price: 1.5 },
            { id: 'feta', name: 'Feta Cheese', price: 2.0 },
            { id: 'avocado', name: 'Avocado', price: 2.5 }
          ]
        }
      ];
    } else if (item.category === 'VEGETARISCH') {
      return [
        {
          id: 'base',
          title: 'Choose Your Base',
          required: true,
          multiSelect: false,
          options: [
            { id: 'falafel', name: 'Falafel', description: 'House-made chickpea falafel' },
            { id: 'veggie_mix', name: 'Vegetable Mix', description: 'Fresh vegetables with feta' },
            { id: 'halloumi', name: 'Halloumi', description: 'Grilled halloumi cheese' }
          ]
        },
        {
          id: 'sauces',
          title: 'Select Your Sauces',
          required: true,
          multiSelect: true,
          maxSelections: 2,
          options: [
            { id: 'tzatziki', name: 'Tzatziki', description: 'Greek yogurt with herbs' },
            { id: 'hummus', name: 'Hummus', description: 'Creamy chickpea hummus' },
            { id: 'tahini', name: 'Tahini', description: 'Sesame seed sauce' },
            { id: 'garlic', name: 'Knoblauch', description: 'Garlic sauce' },
            { id: 'herb', name: 'Herb Sauce', description: 'Fresh herb dressing' }
          ]
        },
        {
          id: 'vegetables',
          title: 'Choose Your Vegetables',
          required: true,
          multiSelect: true,
          options: [
            { id: 'tomato', name: 'Tomatoes', description: 'Fresh sliced tomatoes' },
            { id: 'onions', name: 'Red Onions', description: 'Crisp red onions' },
            { id: 'lettuce', name: 'Lettuce', description: 'Fresh green lettuce' },
            { id: 'cucumber', name: 'Cucumber', description: 'Fresh cucumber slices' },
            { id: 'peppers', name: 'Bell Peppers', description: 'Colorful bell peppers' },
            { id: 'corn', name: 'Corn', description: 'Sweet corn kernels' }
          ]
        },
        {
          id: 'extras',
          title: 'Add Extras (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'feta', name: 'Extra Feta', price: 2.0 },
            { id: 'olives', name: 'Olives', price: 1.5 },
            { id: 'avocado', name: 'Avocado', price: 2.5 }
          ]
        }
      ];
    } else if (item.category === 'HÄHNCHEN') {
      return [
        {
          id: 'preparation',
          title: 'Choose Your Preparation',
          required: true,
          multiSelect: false,
          options: [
            { id: 'grilled', name: 'Grilled', description: 'Flame-grilled for smoky flavor' },
            { id: 'crispy', name: 'Crispy', description: 'Golden crispy coating' },
            { id: 'spicy', name: 'Spicy', description: 'With special spice blend' }
          ]
        },
        {
          id: 'sauces',
          title: 'Select Your Sauces',
          required: false,
          multiSelect: true,
          maxSelections: 2,
          options: [
            { id: 'bbq', name: 'BBQ Sauce', description: 'Smoky barbecue sauce' },
            { id: 'honey_mustard', name: 'Honey Mustard', description: 'Sweet and tangy' },
            { id: 'garlic', name: 'Garlic Sauce', description: 'Creamy garlic sauce' },
            { id: 'hot', name: 'Hot Sauce', description: 'Spicy pepper sauce' },
            { id: 'ranch', name: 'Ranch', description: 'Classic ranch dressing' }
          ]
        },
        {
          id: 'sides',
          title: 'Choose Your Sides',
          required: false,
          multiSelect: true,
          options: [
            { id: 'fries', name: 'Pommes', price: 4.7, description: 'Crispy golden fries' },
            { id: 'rice', name: 'Rice', price: 3.5, description: 'Seasoned rice' },
            { id: 'salad', name: 'Side Salad', price: 5.0, description: 'Fresh mixed salad' },
            { id: 'bread', name: 'Garlic Bread', price: 3.0, description: 'Toasted garlic bread' }
          ]
        }
      ];
    } else if (item.category === 'SNACKS & BEILAGEN') {
      return [
        {
          id: 'portion',
          title: 'Choose Your Portion Size',
          required: true,
          multiSelect: false,
          options: [
            { id: 'regular', name: 'Regular', description: 'Standard portion' },
            { id: 'large', name: 'Large', description: 'Extra large portion', price: 2.0 }
          ]
        },
        {
          id: 'sauces',
          title: 'Add Dipping Sauces (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'ketchup', name: 'Ketchup', description: 'Classic tomato ketchup' },
            { id: 'mayo', name: 'Mayo', description: 'Creamy mayonnaise' },
            { id: 'curry', name: 'Curry Sauce', description: 'Spiced curry sauce' },
            { id: 'garlic', name: 'Garlic Sauce', description: 'Creamy garlic sauce' },
            { id: 'tzatziki', name: 'Tzatziki', description: 'Greek yogurt dip' }
          ]
        },
        {
          id: 'extras',
          title: 'Add Extras (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'cheese', name: 'Cheese', price: 1.5, description: 'Melted cheese on top' },
            { id: 'onions', name: 'Fried Onions', price: 1.0, description: 'Crispy fried onions' },
            { id: 'herbs', name: 'Fresh Herbs', price: 0.5, description: 'Chopped fresh herbs' }
          ]
        }
      ];
    } else if (item.category === 'Pizza') {
      return [
        {
          id: 'extras',
          title: 'Add Extra Toppings',
          required: false,
          multiSelect: true,
          options: [
            { id: 'cheese', name: 'Extra Cheese', price: 2.0 },
            { id: 'pepperoni', name: 'Pepperoni', price: 2.5 },
            { id: 'mushrooms', name: 'Mushrooms', price: 1.5 },
            { id: 'olives', name: 'Olives', price: 1.5 },
            { id: 'peppers', name: 'Bell Peppers', price: 1.5 },
            { id: 'onions', name: 'Red Onions', price: 1.0 },
            { id: 'tomatoes', name: 'Fresh Tomatoes', price: 1.5 },
            { id: 'arugula', name: 'Arugula', price: 2.0 }
          ]
        }
      ];
    } else if (item.category === 'Burger' || item.category === 'Burgers') {
      // Add menu-specific steps if burger menu is selected
      const baseSteps: CustomizationStep[] = [
        {
          id: 'menu_option',
          title: 'Choose Your Option',
          required: true,
          multiSelect: false,
          options: [
            { id: 'burger_only', name: 'Burger Single', description: 'Just the burger' },
            { id: 'burger_menu', name: 'Burger Menü', price: 4.50, description: 'Burger + Pommes + Drink' }
          ]
        }
      ];

      // Check if burger menu is selected to add drink and fries steps
      const isMenuSelected = selections['menu_option']?.includes('burger_menu');
      
      if (isMenuSelected) {
        // Add fries, drinks, and sauces for menu option
        baseSteps.push(
          {
            id: 'menu_fries_size',
            title: 'Choose Your Fries Size (Included)',
            required: true,
            multiSelect: false,
            options: [
              { id: 'fries_small', name: 'Small Fries', description: 'Small portion fries' },
              { id: 'fries_medium', name: 'Medium Fries', price: 1.0, description: 'Medium portion fries (+€1.00)' },
              { id: 'fries_large', name: 'Large Fries', price: 2.0, description: 'Large portion fries (+€2.00)' }
            ]
          },
          {
            id: 'menu_drink',
            title: 'Choose Your Drink (Included)',
            required: true,
            multiSelect: false,
            options: [
              // Fritz-Kola varieties
              { id: 'fritz_kola_original', name: 'Fritz-Kola Original', description: 'Original Fritz Cola' },
              { id: 'fritz_kola_zero', name: 'Fritz-Kola Super Zero', description: 'Sugar-free Fritz Cola' },
              { id: 'fritz_kola_mischmasch', name: 'Fritz-Kola Mischmasch', description: 'Cola-Orange-Lemonade mix' },
              
              // Fritz-Limo varieties
              { id: 'fritz_limo_orange', name: 'Fritz-Limo Orange', description: 'Orange lemonade' },
              { id: 'fritz_limo_lemon', name: 'Fritz-Limo Lemon', description: 'Lemon lemonade' },
              { id: 'fritz_limo_apple_cherry', name: 'Fritz-Limo Apple-Cherry-Elderberry', description: 'Apple-Cherry-Elderberry' },
              { id: 'fritz_limo_honeydew', name: 'Fritz-Limo Honeydew Melon', description: 'Honeydew melon lemonade' },
              { id: 'fritz_limo_ginger', name: 'Fritz-Limo Ginger-Lime', description: 'Ginger-lime lemonade' },
              
              // Fritz-Spritz varieties  
              { id: 'fritz_spritz_apple', name: 'Fritz-Spritz Organic Cloudy Apple', description: 'Organic cloudy apple' },
              { id: 'fritz_spritz_grape', name: 'Fritz-Spritz Organic Grape', description: 'Organic grape spritz' },
              { id: 'fritz_spritz_rhubarb', name: 'Fritz-Spritz Organic Rhubarb', description: 'Organic rhubarb spritz' }
            ]
          },
          {
            id: 'burger_sauces',
            title: 'Extra Sauces (Optional)',
            required: false,
            multiSelect: true,
            maxSelections: 3,
            options: [
              { id: 'burger_sauce', name: 'Burger Sauce', price: 0.5, description: 'Classic burger sauce (+€0.50)' },
              { id: 'ketchup', name: 'Ketchup', price: 0.5, description: 'Traditional tomato ketchup (+€0.50)' },
              { id: 'mayo', name: 'Mayo', price: 0.5, description: 'Creamy mayonnaise (+€0.50)' },
              { id: 'bbq', name: 'BBQ Sauce', price: 0.5, description: 'Smoky barbecue sauce (+€0.50)' },
              { id: 'honey_mustard', name: 'Honey Mustard', price: 0.5, description: 'Sweet and tangy (+€0.50)' },
              { id: 'ranch', name: 'Ranch', price: 0.5, description: 'Creamy ranch dressing (+€0.50)' },
              { id: 'chilli_cheese', name: 'Chilli Cheese', price: 0.5, description: 'Spicy cheese sauce (+€0.50)' },
              { id: 'mango_curry', name: 'Mango Curry', price: 0.5, description: 'Sweet and spicy mango curry sauce (+€0.50)' }
            ]
          }
        );
      } else {
        // If single option selected, add customization options
        baseSteps.push(
          {
            id: 'burger_sauces',
            title: 'Extra Sauces (Optional)',
            required: false,
            multiSelect: true,
            maxSelections: 3,
            options: [
              { id: 'burger_sauce', name: 'Burger Sauce', price: 0.5, description: 'Classic burger sauce (+€0.50)' },
              { id: 'ketchup', name: 'Ketchup', price: 0.5, description: 'Traditional tomato ketchup (+€0.50)' },
              { id: 'mayo', name: 'Mayo', price: 0.5, description: 'Creamy mayonnaise (+€0.50)' },
              { id: 'bbq', name: 'BBQ Sauce', price: 0.5, description: 'Smoky barbecue sauce (+€0.50)' },
              { id: 'honey_mustard', name: 'Honey Mustard', price: 0.5, description: 'Sweet and tangy (+€0.50)' },
              { id: 'ranch', name: 'Ranch', price: 0.5, description: 'Creamy ranch dressing (+€0.50)' },
              { id: 'chilli_cheese', name: 'Chilli Cheese', price: 0.5, description: 'Spicy cheese sauce (+€0.50)' },
              { id: 'mango_curry', name: 'Mango Curry', price: 0.5, description: 'Sweet and spicy mango curry sauce (+€0.50)' }
            ]
          },
          {
            id: 'burger_toppings',
            title: 'Remove Toppings (Select what you DON\'T want)',
            required: false,
            multiSelect: true,
            options: [
              { id: 'no_lettuce', name: 'No Lettuce', description: 'Remove lettuce from burger' },
              { id: 'no_tomato', name: 'No Tomato', description: 'Remove tomato from burger' },
              { id: 'no_onion', name: 'No Onion', description: 'Remove onion from burger' },
              { id: 'no_pickles', name: 'No Pickles', description: 'Remove pickles from burger' },
              { id: 'no_cheese', name: 'No Cheese', description: 'Remove cheese from burger' }
            ]
          },
          {
            id: 'burger_extras',
            title: 'Add Extras (Optional)',
            required: false,
            multiSelect: true,
            options: [
              { id: 'extra_cheese', name: 'Extra Cheese', price: 1.5, description: 'Additional cheese slice (+€1.50)' },
              { id: 'fried_onions', name: 'Fried Onions', price: 1.5, description: 'Crispy fried onions (+€1.50)' },
              { id: 'jalapeños', name: 'Jalapeños', price: 1.0, description: 'Spicy jalapeño slices (+€1.00)' }
            ]
          }
        );
      }

      return baseSteps;
    } else if (item.category === 'Crispy Chicken') {
      return [
        {
          id: 'piece_count',
          title: 'Choose Piece Count',
          required: true,
          multiSelect: false,
          options: [
            { id: '8_pieces', name: '8 Pieces', description: 'Perfect for sharing or a hearty meal' },
            { id: '12_pieces', name: '12 Pieces', price: 4.00, description: 'Great for larger groups (+€4.00)' },
            { id: '18_pieces', name: '18 Pieces', price: 8.00, description: 'Party size portion (+€8.00)' }
          ]
        },
        {
          id: 'spice_level',
          title: 'Spice Level',
          required: true,
          multiSelect: false,
          options: [
            { id: 'mild', name: 'Mild', description: 'Perfect for everyone' },
            { id: 'medium', name: 'Medium', description: 'A bit of kick' },
            { id: 'spicy', name: 'Spicy', description: 'For spice lovers' },
            { id: 'extra_spicy', name: 'Extra Spicy', description: 'Only for the brave!' }
          ]
        },
        {
          id: 'extras',
          title: 'Extra Sauces',
          required: false,
          multiSelect: true,
          options: [
            { id: 'bbq', name: 'BBQ Sauce', price: 0.5 },
            { id: 'honey_mustard', name: 'Honey Mustard', price: 0.5 },
            { id: 'ranch', name: 'Ranch Dressing', price: 0.5 },
            { id: 'buffalo', name: 'Buffalo Sauce', price: 0.5 }
          ]
        }
      ];
    } else {
      // For other items, show general extras
      return [
        {
          id: 'extras',
          title: 'Add Extras',
          required: false,
          multiSelect: true,
          options: [
            { id: 'currywurst_fries', name: 'Currywurst Pommes', price: 12.1 },
            { id: 'fries', name: 'Pommes', price: 4.7 },
            { id: 'nuggets_fries', name: '6x Nuggets + Pommes', price: 8.7 },
            { id: 'meat_portion', name: 'Portion Fleisch', price: 9.6 },
            { id: 'rice_bulgur', name: 'Portion Reis oder Bulgur', price: 5.8 },
            { id: 'mixed_salad', name: 'Gemischter Salat', price: 9.7 },
            { id: 'borek', name: 'Börek (Hackfleisch, Feta oder Spinat)', price: 5.1 },
            { id: 'sauces_extra', name: 'Extra Saucen', price: 2.5 },
            { id: 'bread', name: 'Döner Brot', price: 2.0 },
            { id: 'ketchup_mayo', name: 'Ketchup/Mayo', price: 1.0 }
          ]
        }
      ];
    }
  };

  const steps = getCustomizationSteps();

  const handleOptionSelect = (stepId: string, optionId: string, multiSelect: boolean) => {
    const currentStepData = steps[currentStep];
    
    setSelections(prev => {
      const current = prev[stepId] || [];
      let newSelections;
      
      if (multiSelect) {
        // Toggle selection for multi-select
        if (current.includes(optionId)) {
          newSelections = { ...prev, [stepId]: current.filter(id => id !== optionId) };
        } else {
          // Check if we've reached the maximum selections
          if (currentStepData.maxSelections && current.length >= currentStepData.maxSelections) {
            // If at max, replace the oldest selection with the new one
            const updatedSelections = [...current.slice(1), optionId];
            newSelections = { ...prev, [stepId]: updatedSelections };
          } else {
            newSelections = { ...prev, [stepId]: [...current, optionId] };
          }
        }
      } else {
        // Single select - replace selection
        newSelections = { ...prev, [stepId]: [optionId] };
      }

      // Auto-advance logic
      if (currentStep < steps.length - 1) {
        if (!multiSelect && currentStepData.required) {
          // Single-select required steps: auto-advance immediately
          setIsAutoAdvancing(true);
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
            setIsAutoAdvancing(false);
          }, 800);
        } else if (multiSelect && currentStep < steps.length - 2) {
          // Multi-select steps (except the last one): auto-advance when max reached or after delay
          const newCurrentSelections = newSelections[stepId] || [];
          if (currentStepData.maxSelections && newCurrentSelections.length >= currentStepData.maxSelections) {
            // Auto-advance when max selections reached
            setIsAutoAdvancing(true);
            setTimeout(() => {
              setCurrentStep(currentStep + 1);
              setIsAutoAdvancing(false);
            }, 1200);
          }
        }
      }

      return newSelections;
    });
  };

  const isStepComplete = (step: CustomizationStep): boolean => {
    if (!step.required) return true;
    const stepSelections = selections[step.id] || [];
    return stepSelections.length > 0;
  };

  const canProceedToNext = (): boolean => {
    return isStepComplete(steps[currentStep]);
  };

  const calculateTotalPrice = (): number => {
    let total = item.basePrice * quantity;
    
    // Add extra costs
    steps.forEach(step => {
      const stepSelections = selections[step.id] || [];
      stepSelections.forEach(selectionId => {
        const option = step.options.find(opt => opt.id === selectionId);
        if (option?.price) {
          total += option.price * quantity;
        }
      });
    });

    return total;
  };

  const handleAddToCart = () => {
    // Convert selections to customization format
    const customizations: any[] = [];
    
    steps.forEach(step => {
      const stepSelections = selections[step.id] || [];
      stepSelections.forEach(selectionId => {
        const option = step.options.find(opt => opt.id === selectionId);
        if (option) {
          customizations.push({
            ingredientId: selectionId,
            action: 'add',
            name: option.name,
            price: option.price || 0
          });
        }
      });
    });

    onAddToCart(customizations, quantity);
    onClose();
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-4xl w-full h-[90vh] overflow-hidden shadow-2xl border border-gray-700 flex">
        {/* Left Column - Order Summary */}
        <div className="w-80 bg-gray-800/50 border-r border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Your Order</h3>
            <div className="flex items-center space-x-2">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium text-white">{item.name}</h4>
                <p className="text-sm text-gray-400">€{item.basePrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {steps.map((step, index) => {
                const stepSelections = selections[step.id] || [];
                const isCurrentStep = index === currentStep;
                const isCompleted = index < currentStep || stepSelections.length > 0;
                
                return (
                  <div key={step.id} className={`p-3 rounded-lg border ${
                    isCurrentStep 
                      ? 'border-red-600 bg-red-600/10' 
                      : isCompleted
                      ? 'border-green-600 bg-green-600/10'
                      : 'border-gray-700 bg-gray-800/30'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-sm font-medium ${
                        isCurrentStep ? 'text-red-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {step.title}
                        {step.required && <span className="text-red-400 ml-1">*</span>}
                      </h4>
                      {isCompleted && !isCurrentStep && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    
                    {stepSelections.length > 0 && (
                      <div className="space-y-1">
                        {stepSelections.map(selectionId => {
                          const option = step.options.find(opt => opt.id === selectionId);
                          return option ? (
                            <div key={selectionId} className="flex justify-between text-xs">
                              <span className="text-gray-300">{option.name}</span>
                              {option.price && option.price > 0 && (
                                <span className="text-green-400">+€{option.price.toFixed(2)}</span>
                              )}
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}
                    
                    {stepSelections.length === 0 && (
                      <p className="text-xs text-gray-500">
                        {isCurrentStep ? 'Select options...' : step.required ? 'Required' : 'Optional'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Quantity:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors w-8 h-8 flex items-center justify-center text-sm"
                >
                  −
                </button>
                <span className="text-white font-medium px-3">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors w-8 h-8 flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                Total: €{calculateTotalPrice().toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Step Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              {currentStep > 0 && (
                <button
                  onClick={goToPreviousStep}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{currentStepData.title}</h2>
                <p className="text-sm text-gray-400">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-300" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-800/50">
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex-1 h-2 rounded-full ${
                    index <= currentStep 
                      ? 'bg-red-600' 
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                {currentStepData.title}
                {currentStepData.required && <span className="text-red-400 ml-1">*</span>}
              </h3>
              <p className="text-gray-400 text-sm">
                {currentStepData.multiSelect 
                  ? currentStepData.maxSelections 
                    ? `You can select up to ${currentStepData.maxSelections} option${currentStepData.maxSelections > 1 ? 's' : ''}` 
                    : "You can select multiple options"
                  : "Please select one option"}
                {currentStepData.maxSelections && (selections[currentStepData.id]?.length || 0) > 0 && (
                  <span className="ml-2 text-red-400">
                    ({(selections[currentStepData.id]?.length || 0)} / {currentStepData.maxSelections} selected)
                  </span>
                )}
              </p>
            </div>

            <div className="grid gap-3">
              {currentStepData.options.map((option) => {
                const isSelected = (selections[currentStepData.id] || []).includes(option.id);
                const currentSelections = selections[currentStepData.id] || [];
                const isAtMaxLimit = Boolean(currentStepData.maxSelections && 
                                    currentSelections.length >= currentStepData.maxSelections && 
                                    !isSelected && 
                                    currentStepData.multiSelect);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(currentStepData.id, option.id, currentStepData.multiSelect)}
                    disabled={isAtMaxLimit}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-red-600 bg-red-600/10 text-white'
                        : isAtMaxLimit
                        ? 'border-gray-700 bg-gray-800/30 text-gray-500 cursor-not-allowed opacity-60'
                        : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-red-600 bg-red-600' : 'border-gray-500'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{option.name}</h4>
                            {option.description && (
                              <p className="text-sm text-gray-400">{option.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {option.price && option.price > 0 && (
                        <div className="text-right">
                          <span className="text-lg font-semibold text-green-400">
                            +€{option.price.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="flex space-x-3">
              {currentStep < steps.length - 1 ? (
                <>
                  {currentStepData.multiSelect ? (
                    <button
                      onClick={goToNextStep}
                      disabled={!canProceedToNext()}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                        canProceedToNext()
                          ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:shadow-red-600/25'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>Continue</span>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </button>
                  ) : (
                    <div className="flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-700 text-gray-400 flex items-center justify-center">
                      {isAutoAdvancing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Moving to next step...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Select an option above</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-600/25"
                >
                  Add to Cart - €{calculateTotalPrice().toFixed(2)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;
