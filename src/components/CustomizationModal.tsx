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
  onAddToCart: (customizations: { ingredientId: string; action: string; name: string; price: number }[], quantity: number) => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart
}) => {
  console.log('🚨 CustomizationModal rendered:', { 
    itemName: item.name, 
    itemId: item.id, 
    isOpen, 
    category: item.category, 
    restaurantId: item.restaurantId,
    customizable: item.customizable 
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  // Define steps based on item category
  const getCustomizationSteps = (): CustomizationStep[] => {
    console.log('🚨 getCustomizationSteps called for item:', item.name, 'category:', item.category);
    
    // Check if this is a Sauces item first (regardless of restaurant or category)
    if (item.name === 'Sauces' || item.id === 'sauces-selection') {
      console.log('🚨 SAUCES DETECTED! Creating sauce selection steps', { itemName: item.name, itemId: item.id });
      const baseSteps: CustomizationStep[] = [];
      baseSteps.push({
        id: 'sauce_selection',
        title: 'Choose Your Sauces',
        required: true,
        multiSelect: true,
        maxSelections: 3,
        options: [
          { id: 'ranch-sauce', name: 'Ranch', price: 1.00, description: 'Creamy ranch dressing sauce' },
          { id: 'curry-sauce', name: 'Curry', price: 1.00, description: 'Traditional curry sauce' },
          { id: 'chilli-cheese-sauce', name: 'Chilli Cheese', price: 1.00, description: 'Spicy cheese sauce' },
          { id: 'burger-sauce', name: 'Burgersauce', price: 1.00, description: 'Classic burger sauce' },
          { id: 'ketchup-sauce', name: 'Ketchup', price: 0.50, description: 'Traditional tomato ketchup' },
          { id: 'mayonnaise-sauce', name: 'Mayonnaise', price: 0.50, description: 'Creamy mayonnaise' },
          { id: 'bbq-sauce', name: 'BBQ', price: 0.50, description: 'Smoky barbecue sauce' },
          { id: 'sweet-sour-sauce', name: 'Süss-Sauer', price: 0.50, description: 'Sweet and sour sauce' }
        ]
      });
      
      console.log('🚨 SAUCES baseSteps after adding sauce selection:', baseSteps);
      return baseSteps;
    }
    
    if (item.category === "Mac'n Cheese") {
      return [
        {
          id: 'macncheese_type',
          title: 'Wähle deine Variante',
          required: true,
          multiSelect: false,
          options: [
            { id: 'original', name: 'Original', price: 8.20 },
            { id: 'mit_schnitzel', name: 'Mit Schnitzel Salat + Sauce', price: 12.90 },
            { id: 'mit_doner', name: 'Mit Döner Salat + Sauce', price: 12.90 }
          ]
        }
      ];
    }
    if (item.category === 'Döner' || item.category === 'DÖNER' || item.category === 'DONER' || item.category === 'ROLLO' || item.category === 'TÜRKISCHE PIZZA' || item.category === 'Türkische Pizza' || item.category === 'PIDE' || item.category === 'KONYA' || item.category === 'MENÜ\'S' || item.category === 'Pizza' || item.category === "Mac'n Cheese" || item.category === 'SIDES' || item.category === 'GETRÄNKE' || item.category === 'Getränke' || item.category === 'SAUCEN') {
      // Check if this is a döner-pizza restaurant item
      if (item.restaurantId === 'doner-pizza') {
        const baseSteps: CustomizationStep[] = [];
        
        // Add size selection if available
        if (item.sizes && item.sizes.length > 0) {
          baseSteps.push({
            id: 'item_size',
            title: 'Choose Your Size',
            required: true,
            multiSelect: false,
            options: item.sizes.map((size, index) => ({
              id: `size_${index}`,
              name: size.name,
              price: index > 0 ? (item.basePrice * size.priceMultiplier) - item.basePrice : 0,
              description: index === 0 ? 'Standard size' : 'Larger size'
            }))
          });
        }

        // Add side selection for Döner Teller items
        if (item.name === 'Döner Teller' || item.id === 'doner-teller-dp' || item.id === 'doner-teller') {
          baseSteps.push({
            id: 'side_choice',
            title: 'Choose Your Side',
            required: true,
            multiSelect: false,
            options: [
              { id: 'reis', name: 'Reis', price: 0, description: 'Fluffy rice' },
              { id: 'bulgur', name: 'Bulgur', price: 0, description: 'Traditional bulgur wheat' },
              { id: 'pommes', name: 'Pommes', price: 0, description: 'Crispy french fries' }
            ]
          });
        }

        // Check if this is a PIDE item and add PIDE-specific customization
        if (item.category === 'PIDE') {
          baseSteps.push(
            {
              id: 'pide_vegetables',
              title: 'Add Vegetables (Optional)',
              required: false,
              multiSelect: true,
              options: [
                { id: 'tomate', name: 'Tomate', price: 1.20, description: 'Fresh tomatoes' },
                { id: 'mais', name: 'Mais', price: 1.20, description: 'Sweet corn' },
                { id: 'pilze', name: 'Pilze', price: 1.30, description: 'Fresh mushrooms' },
                { id: 'brokkoli', name: 'Brokkoli', price: 1.40, description: 'Fresh broccoli' },
                { id: 'paprika', name: 'Paprika', price: 1.30, description: 'Bell peppers' },
                { id: 'peperoni', name: 'Peperoni', price: 1.50, description: 'Spicy pepperoni' },
                { id: 'jalapeños', name: 'Jalapeños', price: 1.40, description: 'Spicy jalapeños' },
                { id: 'rote-zwiebeln', name: 'Rote Zwiebeln', price: 1.20, description: 'Red onions' },
                { id: 'ananas', name: 'Ananas', price: 1.20, description: 'Sweet pineapple' }
              ]
            },
            {
              id: 'pide_proteins',
              title: 'Add Proteins (Optional)',
              required: false,
              multiSelect: true,
              options: [
                { id: 'sucuk', name: 'Sucuk', price: 3.00, description: 'Turkish spiced sausage' },
                { id: 'hähnchenfleisch', name: 'Hähnchenfleisch', price: 3.00, description: 'Grilled chicken' },
                { id: 'kalbfleisch', name: 'Kalbfleisch', price: 3.00, description: 'Tender veal' },
                { id: 'rinder-salami', name: 'Rinder Halal Salami', price: 3.00, description: 'Halal beef salami' },
                { id: 'puten-schinken', name: 'Puten Halal Schinken', price: 3.00, description: 'Halal turkey ham' }
              ]
            },
            {
              id: 'pide_cheeses',
              title: 'Add Extra Cheese (Optional)',
              required: false,
              multiSelect: true,
              options: [
                { id: 'feta', name: 'Feta Käse', price: 3.00, description: 'Creamy feta cheese' },
                { id: 'doppel-gouda', name: 'Doppel Gouda Käse', price: 3.00, description: 'Double gouda cheese' },
                { id: 'cheddar', name: 'Cheddar Käse', price: 3.00, description: 'Sharp cheddar cheese' }
              ]
            },
            {
              id: 'pide_extras',
              title: 'Add Extras (Optional)',
              required: false,
              multiSelect: true,
              options: [
                { id: 'hollandaise', name: 'Hollandaise', price: 3.00, description: 'Creamy hollandaise sauce' },
                { id: 'pommes', name: 'Pommes', price: 3.00, description: 'Crispy fries as side' }
              ]
            }
          );
          
          return baseSteps;
        }

        // Check if this is a TÜRKISCHE PIZZA item and add Turkish Pizza-specific customization
        if (item.category === 'TÜRKISCHE PIZZA' || item.category === 'Türkische Pizza') {
          baseSteps.push(
            {
              id: 'turkish_cheese',
              title: 'Add Cheese (Optional)',
              required: false,
              multiSelect: false,
              options: [
                { id: 'turkish-feta', name: 'Feta', price: 2.00, description: 'Creamy feta cheese' },
                { id: 'turkish-gouda', name: 'Gouda', price: 2.00, description: 'Mild gouda cheese' }
              ]
            },
            {
              id: 'turkish_protein',
              title: 'Add Extra Meat (Optional)',
              required: false,
              multiSelect: false,
              options: [
                { id: 'turkish-doppel-fleisch', name: 'Doppel Fleisch', price: 2.50, description: 'Double portion of meat' }
              ]
            },
            {
              id: 'turkish_sauce',
              title: 'Add Sauce (Optional)',
              required: false,
              multiSelect: false,
              options: [
                { id: 'turkish-sauce', name: 'Sauce', price: 1.00, description: 'Traditional Turkish sauce' }
              ]
            }
          );
          
          return baseSteps;
        }

        // Check if this is a Mac'n Cheese item and add Mac'n Cheese-specific customization
        if (item.category === "Mac'n Cheese") {
          baseSteps.push(
            {
              id: 'mac_toppings',
              title: 'Add Belag (Optional)',
              required: false,
              multiSelect: true,
              options: [
                { id: 'mac-coleslaw', name: 'Coleslaw', price: 1.50, description: 'Fresh coleslaw salad' },
                { id: 'mac-weisskraut', name: 'Weißkraut', price: 1.20, description: 'White cabbage' },
                { id: 'mac-rotkraut', name: 'Rotkraut', price: 1.20, description: 'Red cabbage' },
                { id: 'mac-zwiebeln', name: 'Zwiebeln', price: 1.20, description: 'Fresh onions' },
                { id: 'mac-bauernsalat', name: 'Bauernsalat', price: 2.00, description: 'Traditional farmer\'s salad' }
              ]
            },
            {
              id: 'mac_sauces',
              title: 'Add Saucen (Optional)',
              required: false,
              multiSelect: true,
              options: [
                { id: 'mac-chili-cheese', name: 'Chili Cheese', price: 2.50, description: 'Spicy cheese sauce' },
                { id: 'mac-tzatziki', name: 'Tzatziki', price: 2.50, description: 'Greek yogurt sauce' },
                { id: 'mac-cocktail', name: 'Cocktail', price: 2.50, description: 'Cocktail sauce' },
                { id: 'mac-ranch', name: 'Ranch', price: 2.50, description: 'Creamy ranch dressing' },
                { id: 'mac-scharfe-sauce', name: 'Scharfe Sauce', price: 2.50, description: 'Spicy hot sauce' }
              ]
            }
          );
          
          return baseSteps;
        }

        // Check if this is a Börek item and add Börek-specific customization
        if (item.name === 'Börek' || item.id === 'borek-dp') {
          baseSteps.push({
            id: 'borek_filling',
            title: 'Choose Your Filling',
            required: true,
            multiSelect: false,
            options: [
              { id: 'borek-hackfleisch', name: 'Hackfleisch', price: 0, description: 'Traditional ground meat filling' },
              { id: 'borek-feta', name: 'Feta', price: 0, description: 'Creamy feta cheese filling' },
              { id: 'borek-spinat-feta', name: 'Spinat und Feta', price: 0, description: 'Spinach and feta cheese filling' }
            ]
          });
          
          return baseSteps;
        }

        // Check if this is a FRITZ item and add FRITZ-specific customization
        if (item.name === 'FRITZ' || item.id === 'fritz-dp' || item.id === 'fritz-same-drinks') {
          baseSteps.push({
            id: 'fritz_flavor',
            title: 'Choose Your Flavor',
            required: true,
            multiSelect: false,
            options: [
              { id: 'fritz-kola-original', name: 'Kola Original', price: 0, description: 'Classic cola taste' },
              { id: 'fritz-kola-superzero', name: 'Kola SuperZero', price: 0, description: 'Sugar-free cola' },
              { id: 'fritz-honigmelone', name: 'Honigmelone', price: 0, description: 'Honeydew melon flavor' },
              { id: 'fritz-orange', name: 'Orange', price: 0, description: 'Fresh orange taste' },
              { id: 'fritz-zitrone', name: 'Zitrone', price: 0, description: 'Lemon flavor' },
              { id: 'fritz-mischmasch', name: 'Misch Masch', price: 0, description: 'Mixed fruit flavors' }
            ]
          });
          
          return baseSteps;
        }

        // Check if this is a Premium Saucen item and add Premium Saucen-specific customization
        if (item.name === 'Premium Saucen' || item.id === 'premium-saucen-dp') {
          baseSteps.push({
            id: 'premium_sauce_selection',
            title: 'Choose Your Premium Sauces',
            required: true,
            multiSelect: true,
            options: [
              { id: 'premium-chili-cheese', name: 'Chili Cheese', price: 0, description: 'Spicy cheese sauce' },
              { id: 'premium-ranch', name: 'Ranch', price: 0, description: 'Creamy ranch dressing' },
              { id: 'premium-curry', name: 'Curry', price: 0, description: 'Spicy curry sauce' },
              { id: 'premium-cocktail', name: 'Cocktail', price: 0, description: 'Classic cocktail sauce' },
              { id: 'premium-tzatziki', name: 'Tzatziki', price: 0, description: 'Greek yogurt sauce with herbs' },
              { id: 'premium-knoblauch', name: 'Knoblauch', price: 0, description: 'Garlic sauce' },
              { id: 'premium-scharfe-sauce', name: 'Scharfe Sauce', price: 0, description: 'Hot and spicy sauce' }
            ]
          });
          
          return baseSteps;
        }

        // Add döner-pizza specific ingredients
        baseSteps.push(
          {
            id: 'doner_ingredients',
            title: 'Customize Your Ingredients',
            required: false,
            multiSelect: true,
            options: [
              { id: 'doner-fleisch', name: 'Extra Döner Fleisch', price: 2.50, description: 'Extra döner meat' },
              { id: 'hahnchenfleisch', name: 'Hähnchenfleisch', price: 2.50, description: 'Grilled chicken' },
              { id: 'sucuk', name: 'Sucuk', price: 2.50, description: 'Turkish spiced sausage' },
              { id: 'falafel', name: 'Falafel', price: 2.00, description: 'Chickpea falafel' },
              { id: 'tomate', name: 'Extra Tomate', price: 1.00, description: 'Fresh tomatoes' },
              { id: 'mais', name: 'Mais', price: 1.00, description: 'Sweet corn' },
              { id: 'pilze', name: 'Pilze', price: 1.00, description: 'Fresh mushrooms' },
              { id: 'paprika', name: 'Paprika', price: 1.00, description: 'Bell peppers' },
              { id: 'rote-zwiebeln', name: 'Rote Zwiebeln', price: 1.00, description: 'Red onions' },
              { id: 'peperoni', name: 'Peperoni', price: 1.00, description: 'Spicy pepperoni' },
              { id: 'jallapenos', name: 'Jalapeños', price: 1.00, description: 'Spicy jalapeños' }
            ]
          },
          {
            id: 'cheese_options',
            title: 'Add Cheese (Optional)',
            required: false,
            multiSelect: true,
            options: [
              { id: 'feta', name: 'Feta', price: 1.50, description: 'Creamy feta cheese' },
              { id: 'gouda', name: 'Extra Gouda', price: 1.50, description: 'Extra gouda cheese' },
              { id: 'cheddar', name: 'Cheddar', price: 1.50, description: 'Sharp cheddar cheese' }
            ]
          },
          {
            id: 'sauces',
            title: 'Add Sauces (Optional)',
            required: false,
            multiSelect: true,
            options: [
              { id: 'saucen-premium', name: 'Saucen Premium', price: 5.00, description: 'Choose from ALL available sauces' },
              { id: 'tzaziki', name: 'Tzatziki', price: 0.50, description: 'Greek yogurt sauce' },
              { id: 'chili-cheese', name: 'Chili Cheese', price: 1.00, description: 'Spicy cheese sauce' },
              { id: 'ranch', name: 'Ranch', price: 0.50, description: 'Creamy ranch dressing' },
              { id: 'hollandaise', name: 'Hollandaise', price: 0.50, description: 'Rich hollandaise sauce' },
              { id: 'cocktail', name: 'Cocktail', price: 0.50, description: 'Cocktail sauce' },
              { id: 'curry', name: 'Curry', price: 0.50, description: 'Curry sauce' },
              { id: 'knoblauch', name: 'Knoblauch', price: 0.50, description: 'Garlic sauce' },
              { id: 'scharfe-sauce', name: 'Scharfe Sauce', price: 0.50, description: 'Spicy hot sauce' },
              { id: 'ketchup', name: 'Ketchup', price: 0.50, description: 'Classic ketchup' },
              { id: 'mayo', name: 'Mayo', price: 0.50, description: 'Mayonnaise' }
            ]
          },
          {
            id: 'extras',
            title: 'Add Extras (Optional)',
            required: false,
            multiSelect: true,
            options: [
              { id: 'pommes', name: 'Pommes', price: 3.00, description: 'Crispy fries' }
            ]
          },
          {
            id: 'drinks',
            title: 'Add Drinks (Optional)',
            required: false,
            multiSelect: true,
            options: [
              { id: 'coca-cola-033', name: 'Coca Cola (0,33l)', price: 2.50, description: 'Classic Coca Cola' },
              { id: 'fanta-033', name: 'Fanta (0,33l)', price: 2.50, description: 'Orange Fanta' },
              { id: 'sprite-033', name: 'Sprite (0,33l)', price: 2.50, description: 'Lemon-lime Sprite' },
              { id: 'wasser-033', name: 'Wasser (0,33l)', price: 2.00, description: 'Still water' },
              { id: 'apfelschorle-033', name: 'Apfelschorle (0,33l)', price: 2.50, description: 'Apple juice spritzer' }
            ]
          }
        );
        
        return baseSteps;
      }
      
      // Use the same customization steps as Burger/Burgers for regular döner restaurant
      const baseSteps: CustomizationStep[] = [
        {
          id: 'menu_option',
          title: 'Choose Your Option',
          required: true,
          multiSelect: false,
          options: [
            { id: 'single_only', name: `${item.category} Single`, description: `Just the ${item.category.toLowerCase()}`, price: 0 },
            { id: 'menu', name: `${item.category} Menü`, price: 7.00, description: `${item.category} + Pommes + Drink (+€7.00)` }
          ]
        }
      ];

      const isMenuSelected = selections['menu_option']?.includes('menu');

      if (isMenuSelected) {
        baseSteps.push(
          {
            id: 'menu_drink',
            title: 'Choose Your Drink (Included)',
            required: true,
            multiSelect: false,
            options: [
              { id: 'fritz_kola_original', name: 'Fritz-Kola Original', description: 'Original Fritz Cola' },
              { id: 'fritz_kola_zero', name: 'Fritz-Kola Super Zero', description: 'Sugar-free Fritz Cola' },
              { id: 'fritz_kola_mischmasch', name: 'Fritz-Kola Mischmasch', description: 'Cola-Orange-Lemonade mix' },
              { id: 'fritz_limo_orange', name: 'Fritz-Limo Orange', description: 'Orange lemonade' },
              { id: 'fritz_limo_lemon', name: 'Fritz-Limo Lemon', description: 'Lemon lemonade' },
              { id: 'fritz_limo_apple_cherry', name: 'Fritz-Limo Apple-Cherry-Elderberry', description: 'Apple-Cherry-Elderberry' },
              { id: 'fritz_limo_honeydew', name: 'Fritz-Limo Honeydew Melon', description: 'Honeydew melon lemonade' },
              { id: 'fritz_limo_ginger', name: 'Fritz-Limo Ginger-Lime', description: 'Ginger-lime lemonade' },
              { id: 'fritz_spritz_apple', name: 'Fritz-Spritz Organic Cloudy Apple', description: 'Organic cloudy apple' },
              { id: 'fritz_spritz_grape', name: 'Fritz-Spritz Organic Grape', description: 'Organic grape spritz' },
              { id: 'fritz_spritz_rhubarb', name: 'Fritz-Spritz Organic Rhubarb', description: 'Organic rhubarb spritz' }
            ]
          },
          {
            id: 'sauces',
            title: 'Extra Sauces',
            required: false,
            multiSelect: true,
            options: [
              { id: 'cocktail', name: 'Cocktail', description: 'Creamy cocktail sauce' },
              { id: 'tzatziki', name: 'Tzatziki', description: 'Greek yogurt with herbs' },
              { id: 'curry', name: 'Curry', description: 'Spicy curry sauce' },
              { id: 'garlic', name: 'Knoblauch', description: 'Garlic sauce' },
              { id: 'hot', name: 'Scharfe Sauce', description: 'Spicy hot sauce' },
              { id: 'ranch', name: 'Ranch', description: 'Creamy ranch dressing' },
              { id: 'chili-cheese', name: 'Chili Cheese', description: 'Spicy cheese sauce' }
            ]
          }
        );
      } else {
        baseSteps.push(
          {
            id: 'sauces',
            title: 'Extra Sauces',
            required: false,
            multiSelect: true,
            options: [
              { id: 'cocktail', name: 'Cocktail', description: 'Creamy cocktail sauce' },
              { id: 'tzatziki', name: 'Tzatziki', description: 'Greek yogurt with herbs' },
              { id: 'curry', name: 'Curry', description: 'Spicy curry sauce' },
              { id: 'garlic', name: 'Knoblauch', description: 'Garlic sauce' },
              { id: 'hot', name: 'Scharfe Sauce', description: 'Spicy hot sauce' },
              { id: 'ranch', name: 'Ranch', description: 'Creamy ranch dressing' },
              { id: 'chili-cheese', name: 'Chili Cheese', description: 'Spicy cheese sauce' }
            ]
          },
          {
            id: 'toppings',
            title: 'Remove Toppings',
            required: false,
            multiSelect: true,
            options: [
              { id: 'no_lettuce', name: 'No Lettuce', description: 'Remove lettuce' },
              { id: 'no_tomato', name: 'No Tomato', description: 'Remove tomato' },
              { id: 'no_onion', name: 'No Onion', description: 'Remove onion' },
              { id: 'no_white_cabbage', name: 'No White Cabbage', description: 'Remove white cabbage' },
              { id: 'no_red_cabbage', name: 'No Red Cabbage', description: 'Remove red cabbage' },
              { id: 'no_cheese', name: 'No Cheese', description: 'Remove cheese' }
            ]
          },
          {
            id: 'extras',
            title: 'Add Extras (Optional)',
            required: false,
            multiSelect: true,
            options: [
              { id: 'extra_cheese', name: 'Extra Cheese', price: 1.5, description: 'Additional cheese (+€1.50)' },
              { id: 'feta', name: 'Feta Cheese', price: 2.0, description: 'Feta cheese (+€2.00)' },
              { id: 'avocado', name: 'Avocado', price: 2.5, description: 'Avocado (+€2.50)' }
            ]
          }
        );
      }
      return baseSteps;
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
    } else if (item.category === 'SNACKS & BEILAGEN' || (item.category === 'Sides' && item.name === 'Pommes')) {
      return [
        {
          id: 'pommes_upgrade',
          title: 'Upgrade Your Pommes',
          required: false,
          multiSelect: true,
          options: [
            { id: 'chilli_cheese_pommes', name: 'Chilli Cheese Pommes', price: 2.0, description: 'Mit Chilli Cheese Sauce' },
            { id: 'garlic_parmesan_pommes', name: 'Garlic Parmesan Pommes', price: 2.0, description: 'Mit Knoblauch-Parmesan' }
          ]
        },
        {
          id: 'sauces',
          title: 'Add Dipping Sauces (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'ketchup', name: 'Ketchup', price: 1.0, description: 'Classic tomato ketchup (+€1.00)' },
            { id: 'mayo', name: 'Mayo', price: 1.0, description: 'Creamy mayonnaise (+€1.00)' },
            { id: 'curry', name: 'Curry Sauce', price: 1.0, description: 'Spiced curry sauce (+€1.00)' },
            { id: 'garlic', name: 'Garlic Sauce', price: 1.0, description: 'Creamy garlic sauce (+€1.00)' },
            { id: 'tzatziki', name: 'Tzatziki', price: 1.0, description: 'Greek yogurt dip (+€1.00)' }
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
    } else if (item.category === 'PIZZA') {
      const baseSteps: CustomizationStep[] = [];
      
      // Add size selection for pizzas
      if (item.sizes && item.sizes.length > 0) {
        baseSteps.push({
          id: 'pizza_size',
          title: 'Choose Your Pizza Size',
          required: true,
          multiSelect: false,
          options: item.sizes.map((size, index) => ({
            id: `size_${index}`,
            name: size.name,
            price: index > 0 ? (item.basePrice * size.priceMultiplier) - item.basePrice : 0,
            description: index === 0 ? 'Standard size' : 'Larger size'
          }))
        });
      }

      // Add pizza-specific ingredients as upgrades
      baseSteps.push(
        {
          id: 'pizza_vegetables',
          title: 'Add Vegetables (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'pizza-tomate', name: 'Tomate', price: 1.20, description: 'Fresh tomatoes' },
            { id: 'pizza-mais', name: 'Mais', price: 1.20, description: 'Sweet corn' },
            { id: 'pizza-pilze', name: 'Pilze', price: 1.30, description: 'Fresh mushrooms' },
            { id: 'pizza-brokkoli', name: 'Brokkoli', price: 1.40, description: 'Fresh broccoli' },
            { id: 'pizza-paprika', name: 'Paprika', price: 1.30, description: 'Bell peppers' },
            { id: 'pizza-peperoni', name: 'Peperoni', price: 1.50, description: 'Spicy pepperoni' },
            { id: 'pizza-jallapenos', name: 'Jalapeños', price: 1.40, description: 'Spicy jalapeños' },
            { id: 'pizza-rote-zwiebeln', name: 'Rote Zwiebeln', price: 1.20, description: 'Red onions' },
            { id: 'pizza-ananas', name: 'Ananas', price: 1.20, description: 'Sweet pineapple' }
          ]
        },
        {
          id: 'pizza_proteins',
          title: 'Add Proteins (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'pizza-sucuk', name: 'Sucuk', price: 3.00, description: 'Turkish spiced sausage' },
            { id: 'pizza-hahnchenfleisch', name: 'Hähnchenfleisch', price: 3.00, description: 'Grilled chicken' },
            { id: 'pizza-kalbfleisch', name: 'Kalbfleisch', price: 3.00, description: 'Tender veal' },
            { id: 'pizza-rinder-salami', name: 'Rinder Halal Salami', price: 3.00, description: 'Halal beef salami' },
            { id: 'pizza-puten-schinken', name: 'Puten Halal Schinken', price: 3.00, description: 'Halal turkey ham' }
          ]
        },
        {
          id: 'pizza_cheeses',
          title: 'Add Extra Cheese (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'pizza-feta', name: 'Feta Käse', price: 3.00, description: 'Creamy feta cheese' },
            { id: 'pizza-doppel-gouda', name: 'Doppel Gouda', price: 3.00, description: 'Double gouda cheese' },
            { id: 'pizza-cheddar', name: 'Cheddar Käse', price: 3.00, description: 'Sharp cheddar cheese' }
          ]
        },
        {
          id: 'pizza_extras',
          title: 'Add Extras (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'pizza-hollandaise', name: 'Hollandaise', price: 3.00, description: 'Creamy hollandaise sauce' },
            { id: 'pizza-pommes', name: 'Pommes', price: 3.00, description: 'Crispy fries on pizza' }
          ]
        },
        {
          id: 'pizza_drinks',
          title: 'Add Drinks (Optional)',
          required: false,
          multiSelect: true,
          options: [
            { id: 'coca-cola-033', name: 'Coca Cola (0,33l)', price: 2.50, description: 'Classic Coca Cola' },
            { id: 'fanta-033', name: 'Fanta (0,33l)', price: 2.50, description: 'Orange Fanta' },
            { id: 'sprite-033', name: 'Sprite (0,33l)', price: 2.50, description: 'Lemon-lime Sprite' },
            { id: 'wasser-033', name: 'Wasser (0,33l)', price: 2.00, description: 'Still water' },
            { id: 'apfelschorle-033', name: 'Apfelschorle (0,33l)', price: 2.50, description: 'Apple juice spritzer' }
          ]
        }
      );
      
      return baseSteps;
    } else if (item.category === 'Burger' || item.category === 'Burgers') {
      // Add menu-specific steps if burger menu is selected
      const baseSteps: CustomizationStep[] = [
        {
          id: 'menu_option',
          title: 'Choose Your Option',
          required: true,
          multiSelect: false,
          options: [
            { id: 'burger_only', name: 'Burger Single', description: 'Just the burger', price: 0 },
            { id: 'burger_menu', name: 'Burger Menü', price: 7.00, description: 'Burger + Pommes + Drink (+€7.00)' }
          ]
        }
      ];

      // Check if burger menu is selected to add drink and fries steps
      const isMenuSelected = selections['menu_option']?.includes('burger_menu');
      
      if (isMenuSelected) {
        // Add drinks and sauces for menu option (no fries size)
        baseSteps.push(
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
              { id: 'burger_sauce', name: 'Burger Sauce', price: 1.0, description: 'Classic burger sauce (+€1.00)' },
              { id: 'ketchup', name: 'Ketchup', price: 0.5, description: 'Traditional tomato ketchup (+€0.50)' },
              { id: 'mayo', name: 'Mayo', price: 0.5, description: 'Creamy mayonnaise (+€0.50)' },
              { id: 'bbq', name: 'BBQ Sauce', price: 0.5, description: 'Smoky barbecue sauce (+€0.50)' },
              { id: 'ranch', name: 'Ranch', price: 1.0, description: 'Creamy ranch dressing (+€1.00)' },
              { id: 'curry', name: 'Curry', price: 1.0, description: 'Traditional curry sauce (+€1.00)' },
              { id: 'chilli_cheese', name: 'Chilli Cheese', price: 1.0, description: 'Spicy cheese sauce (+€1.00)' },
              { id: 'suess_sauer', name: 'Süss-Sauer', price: 0.5, description: 'Sweet and sour sauce (+€0.50)' }
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
              { id: 'burger_sauce', name: 'Burger Sauce', price: 1.0, description: 'Classic burger sauce (+€1.00)' },
              { id: 'ketchup', name: 'Ketchup', price: 0.5, description: 'Traditional tomato ketchup (+€0.50)' },
              { id: 'mayo', name: 'Mayo', price: 0.5, description: 'Creamy mayonnaise (+€0.50)' },
              { id: 'bbq', name: 'BBQ Sauce', price: 0.5, description: 'Smoky barbecue sauce (+€0.50)' },
              { id: 'ranch', name: 'Ranch', price: 1.0, description: 'Creamy ranch dressing (+€1.00)' },
              { id: 'curry', name: 'Curry', price: 1.0, description: 'Traditional curry sauce (+€1.00)' },
              { id: 'chilli_cheese', name: 'Chilli Cheese', price: 1.0, description: 'Spicy cheese sauce (+€1.00)' },
              { id: 'suess_sauer', name: 'Süss-Sauer', price: 0.5, description: 'Sweet and sour sauce (+€0.50)' }
            ]
          },
          {
            id: 'burger_toppings',
            title: 'Remove Toppings',
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
    } else if (item.category === 'Buckets' && item.customizable) {
      const steps = [];
      
      // Determine sauce and drink limits based on bucket type
      let sauceLimit = 1;
      let drinkLimit = 1;
      
      if (item.name === 'Filet Bucket' || item.name === 'Keulen Bucket' || item.name === 'Twice Mix Bucket') {
        sauceLimit = 2;
        drinkLimit = 2;
      } else if (item.name === 'Family Mix Bucket') {
        sauceLimit = 4;
        drinkLimit = 4;
      }
      
      // Add sauce selection for all buckets
      steps.push({
        id: 'bucket_sauces',
        title: `Choose Your Sauces (up to ${sauceLimit})`,
        required: true,
        multiSelect: true,
        maxSelections: sauceLimit,
        options: [
          { id: 'ranch-sauce', name: 'Ranch', price: 0.50, description: 'Creamy ranch dressing sauce' },
          { id: 'curry-sauce', name: 'Curry', price: 0.50, description: 'Traditional curry sauce' },
          { id: 'chilli-cheese-sauce', name: 'Chilli Cheese', price: 0.50, description: 'Spicy cheese sauce' },
          { id: 'burger-sauce', name: 'Burgersauce', price: 0.50, description: 'Classic burger sauce' },
          { id: 'ketchup-sauce', name: 'Ketchup', price: 0.30, description: 'Traditional tomato ketchup' },
          { id: 'mayonnaise-sauce', name: 'Mayonnaise', price: 0.30, description: 'Creamy mayonnaise' },
          { id: 'bbq-sauce', name: 'BBQ', price: 0.30, description: 'Smoky barbecue sauce' },
          { id: 'sweet-sour-sauce', name: 'Süss-Sauer', price: 0.30, description: 'Sweet and sour sauce' }
        ]
      });
      
      // Add FRITZ drink selection
      steps.push({
        id: 'bucket_fritz_drink',
        title: `Choose Your FRITZ Drinks (up to ${drinkLimit})`,
        required: true,
        multiSelect: drinkLimit > 1,
        maxSelections: drinkLimit,
        options: [
          { id: 'fritz-kola', name: 'FRITZ Kola', price: 2.90, description: 'Classic cola with real kola nut' },
          { id: 'fritz-limo-zitrone', name: 'FRITZ Limo Zitrone', price: 2.90, description: 'Lemon flavored lemonade' },
          { id: 'fritz-limo-orange', name: 'FRITZ Limo Orange', price: 2.90, description: 'Orange flavored lemonade' },
          { id: 'fritz-limo-apfel', name: 'FRITZ Limo Apfel', price: 2.90, description: 'Apple flavored lemonade' },
          { id: 'fritz-spritz-rhababer', name: 'FRITZ Spritz Rhabarber', price: 2.90, description: 'Sparkling rhubarb drink' },
          { id: 'fritz-kola-zucker-frei', name: 'FRITZ Kola Zucker Frei', price: 2.90, description: 'Sugar-free cola with stevia' }
        ]
      });
      
      return steps;
    } else if (item.category === 'Flavour Chicken') {
      const steps = [];
      // For Flavour Chicken, add piece count selection first with actual prices from the menu
      // Map actual prices for each Flavour Chicken type
  let pieceOptions: { id: string; name: string; price: number }[] = [];
        if (item.name.includes('Keulen')) {
          pieceOptions = [
            { id: '6_stk', name: '6 Stk.', price: 7.90 },
            { id: '12_stk', name: '12 Stk.', price: 15.10 },
            { id: '18_stk', name: '18 Stk.', price: 21.40 }
          ];
        } else if (item.name.includes('Wings')) {
          pieceOptions = [
            { id: '6_stk', name: '6 Stk.', price: 7.90 },
            { id: '12_stk', name: '12 Stk.', price: 15.10 },
            { id: '18_stk', name: '18 Stk.', price: 21.40 }
          ];
        } else if (item.name.includes('Strips')) {
          pieceOptions = [
            { id: '4_stk', name: '4 Stk.', price: 7.90 },
            { id: '8_stk', name: '8 Stk.', price: 14.90 },
            { id: '12_stk', name: '12 Stk.', price: 21.90 }
          ];
        } else if (item.name.includes('Bites')) {
          pieceOptions = [
            { id: '8_stk', name: '8 Stk.', price: 8.90 },
            { id: '12_stk', name: '12 Stk.', price: 11.90 },
            { id: '24_stk', name: '24 Stk.', price: 22.40 }
          ];
        }
        steps.push({
          id: 'piece_count',
          title: 'Choose Piece Count',
          required: true,
          multiSelect: false,
          options: pieceOptions
        });
      
      // Add flavour selection
      steps.push({
        id: 'flavour_choice',
        title: 'Choose Your Flavour',
        required: true,
        multiSelect: false,
        options: [
          { id: 'bbq', name: 'BBQ', description: 'Classic smoky barbecue flavour' },
          { id: 'mango', name: 'Mango', description: 'Sweet and tropical mango flavour' },
          { id: 'chili_cheese', name: 'Chili Cheese', description: 'Spicy cheese flavouring' },
          { id: 'garlic_parmesan', name: 'Garlic Parmesan', description: 'Savoury garlic and parmesan' },
          { id: 'buffalo', name: 'Buffalo', description: 'Hot and tangy buffalo sauce' },
          { id: 'lemon_pepper', name: 'Lemon Pepper', description: 'Zesty lemon with black pepper' }
        ]
      });
      return steps;
    } else if (item.category === 'Crispy Chicken') {
      return [
        {
          id: 'piece_count',
          title: 'Choose Piece Count',
          required: true,
          multiSelect: false,
          options: item.sizes ? item.sizes.map((size, index) => ({
            id: `size_${index}`,
            name: size.name,
            price: index > 0 ? (item.basePrice * size.priceMultiplier) - item.basePrice : 0,
            description: index === 0 ? 'Perfect for a quick meal' : index === 1 ? 'Great for sharing' : 'Party size portion'
          })) : [
            { id: '6_pieces', name: '6 Pieces', description: 'Perfect for a quick meal' },
            { id: '12_pieces', name: '12 Pieces', price: 6.70, description: 'Great for sharing (+€6.70)' },
            { id: '18_pieces', name: '18 Pieces', price: 13.00, description: 'Party size portion (+€13.00)' }
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
  const currentStepData = steps[currentStep];

  // Defensive: If no steps or currentStepData, show fallback UI
  if (!isOpen || !steps.length || !currentStepData) {
    return isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl max-w-md w-full p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No customization available</h2>
          <p className="mb-6">This item cannot be customized at the moment.</p>
          <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-semibold transition-all duration-300">Close</button>
        </div>
      </div>
    ) : null;
  }

  const handleOptionSelect = (stepId: string, optionId: string, multiSelect: boolean) => {
    setSelections(prev => {
      const current = prev[stepId] || [];
      let newSelections;
      const stepData = steps.find(s => s.id === stepId) || currentStepData;
      if (multiSelect) {
        // Toggle selection for multi-select
        if (current.includes(optionId)) {
          newSelections = { ...prev, [stepId]: current.filter(id => id !== optionId) };
        } else {
          // Check if we've reached the maximum selections (except for sauces)
          if (stepData.maxSelections && current.length >= stepData.maxSelections && stepId !== 'sauces') {
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
        if (!multiSelect && stepData.required) {
          // Single-select required steps: auto-advance immediately
          setIsAutoAdvancing(true);
          setTimeout(() => {
            setCurrentStep(currentStep + 1);
            setIsAutoAdvancing(false);
          }, 800);
        } else if (multiSelect && currentStep < steps.length - 2) {
          // Multi-select steps (except the last one): auto-advance when max reached or after delay
          // ...existing code...
        }
      }
      return newSelections;
    });
  };

  const handleAddToCart = () => {
    // Convert selections to customization format
    const customizations: { ingredientId: string; action: string; name: string; price: number }[] = [];
    steps.forEach(step => {
      const stepSelections = selections[step.id] || [];
      stepSelections.forEach((selectionId, index) => {
        const option = step.options.find(opt => opt.id === selectionId);
        if (option) {
          let price = option.price || 0;
          
          // Special pricing for sauces: first 2 are free, rest cost €1.00
          if (step.id === 'sauces' && index >= 2) {
            price = 1.00;
          }
          
          customizations.push({
            ingredientId: selectionId,
            action: 'add',
            name: option.name,
            price: price
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

  // Prevent customization for sauces and drinks
  if (!isOpen || item.category === 'Sauces' || item.category === 'Drinks') return null;

  // Helper: Calculate total price
  const calculateTotalPrice = () => {
    // Special logic for Mac'n Cheese: use only the selected variant's price
    if (item.category === "Mac'n Cheese") {
      const macStep = steps.find(s => s.id === 'macncheese_type');
      if (macStep) {
        const selected = selections['macncheese_type']?.[0];
        const option = macStep.options.find(opt => opt.id === selected);
        if (option?.price) {
          return option.price * quantity;
        }
      }
      return 0;
    }
    // Default: base price plus extras
    let total = item.basePrice * quantity;
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

  // Helper: Can proceed to next step
  const canProceedToNext = () => {
    const step = steps[currentStep];
    if (!step) return false;
    const selected = selections[step.id] || [];
    if (step.required) {
      if (step.multiSelect) {
        if (step.maxSelections) {
          return selected.length > 0 && selected.length <= step.maxSelections;
        }
        return selected.length > 0;
      }
      return selected.length === 1;
    }
    return true;
  };




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
                const isPreviousStep = index < currentStep;
                
                return (
                  <div 
                    key={step.id} 
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      isCurrentStep 
                        ? 'border-red-600 bg-red-600/10' 
                        : isCompleted
                        ? 'border-green-600 bg-green-600/10 hover:bg-green-600/20'
                        : 'border-gray-700 bg-gray-800/30'
                    } ${isPreviousStep ? 'cursor-pointer' : ''}`}
                    onClick={isPreviousStep ? () => setCurrentStep(index) : undefined}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-sm font-medium ${
                        isCurrentStep ? 'text-red-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {step.title}
                        {step.required && <span className="text-red-400 ml-1">*</span>}
                        {isPreviousStep && (
                          <span className="ml-2 text-xs text-gray-500">(click to edit)</span>
                        )}
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
                                    currentStepData.multiSelect &&
                                    currentStepData.id !== 'sauces');
                
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
                      {(() => {
                        // Dynamic pricing for sauces
                        if (currentStepData.id === 'sauces') {
                          const selectedCount = currentSelections.length;
                          
                          if (isSelected) {
                            // If this sauce is already selected, check if it's in position 3+
                            const saucePosition = currentSelections.indexOf(option.id);
                            if (saucePosition >= 2) {
                              return (
                                <div className="text-right">
                                  <span className="text-lg font-semibold text-red-400">
                                    +€1.00
                                  </span>
                                </div>
                              );
                            }
                          } else {
                            // If not selected, show price if selecting it would make it the 3rd+ sauce
                            if (selectedCount >= 2) {
                              return (
                                <div className="text-right">
                                  <span className="text-lg font-semibold text-red-400">
                                    +€1.00
                                  </span>
                                </div>
                              );
                            }
                          }
                          return null;
                        }
                        
                        // Regular price display for non-sauce items
                        if (option.price && option.price > 0) {
                          return (
                            <div className="text-right">
                              <span className="text-lg font-semibold text-green-400">
                                +€{option.price.toFixed(2)}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
