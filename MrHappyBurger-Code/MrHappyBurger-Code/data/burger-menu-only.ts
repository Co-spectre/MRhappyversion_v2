// Mr.Happy Burger Menu Items Only
// Extracted from main restaurants.ts file
// Contains only burger restaurant items with Euro currency and custom images

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image: string;
  category: string;
  restaurantId: string;
  dietaryInfo: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    spicy: number;
    halal: boolean;
  };
  allergens: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  customizable: boolean;
  popular: boolean;
  preparationTime: string;
  origin: string;
  nutritionScore: string;
  chefRecommended?: boolean;
  onlineDiscount?: {
    percentage: number;
    originalPrice: number;
  };
  sizes?: {
    name: string;
    priceMultiplier: number;
  }[];
}

export interface Ingredient {
  id: string;
  name: string;
  basePrice: number;
  extraPrice: number;
  doublePrice: number;
  category: string;
  isPremium: boolean;
}

// Burger Customization Ingredients (Euro Currency)
export const burgerIngredients: Ingredient[] = [
  { id: 'chicken', name: 'Grilled Chicken', basePrice: 0, extraPrice: 3.50, doublePrice: 6.50, category: 'protein', isPremium: false },
  { id: 'beef', name: 'Premium Beef', basePrice: 0, extraPrice: 4.50, doublePrice: 8.50, category: 'protein', isPremium: true },
  { id: 'lamb', name: 'Lamb', basePrice: 0, extraPrice: 5.00, doublePrice: 9.50, category: 'protein', isPremium: true },
  { id: 'turkey', name: 'Turkey', basePrice: 0, extraPrice: 3.00, doublePrice: 5.50, category: 'protein', isPremium: false },
  { id: 'bacon', name: 'Crispy Bacon', basePrice: 0, extraPrice: 2.50, doublePrice: 4.50, category: 'protein', isPremium: false },
  { id: 'lettuce', name: 'Fresh Lettuce', basePrice: 0, extraPrice: 0.50, doublePrice: 1.00, category: 'vegetable', isPremium: false },
  { id: 'tomato', name: 'Tomatoes', basePrice: 0, extraPrice: 0.75, doublePrice: 1.25, category: 'vegetable', isPremium: false },
  { id: 'jalapenos', name: 'Jalapeños', basePrice: 0, extraPrice: 0.75, doublePrice: 1.25, category: 'vegetable', isPremium: false },
  { id: 'onion', name: 'Red Onions', basePrice: 0, extraPrice: 0.50, doublePrice: 0.90, category: 'vegetable', isPremium: false },
  { id: 'pickles', name: 'Pickles', basePrice: 0, extraPrice: 0.50, doublePrice: 0.90, category: 'vegetable', isPremium: false },
  { id: 'cheddar', name: 'Cheese', basePrice: 0, extraPrice: 1.50, doublePrice: 2.75, category: 'cheese', isPremium: false },
  { id: 'swiss', name: 'Swiss Cheese', basePrice: 0, extraPrice: 2.00, doublePrice: 3.50, category: 'cheese', isPremium: true },
  { id: 'blue-cheese', name: 'Blue Cheese', basePrice: 0, extraPrice: 2.50, doublePrice: 4.50, category: 'cheese', isPremium: true }
];

// Mr.Happy Burger Menu Items ONLY
export const mrHappyBurgerMenuItems: MenuItem[] = [
  // === BURGER ITEMS (Customizable) ===
  {
    id: 'smash-cheese',
    name: 'Smash Cheese',
    description: 'Smashed beef patty with melted cheese',
    basePrice: 6.90,
    image: '/images/cheeseburger.jpeg',
    category: 'Burgers',
    restaurantId: 'burger',
    dietaryInfo: { vegetarian: false, vegan: false, glutenFree: false, spicy: 0, halal: true },
    allergens: ['gluten', 'dairy'],
    calories: 580,
    protein: 25,
    carbs: 45,
    fat: 32,
    ingredients: ['beef', 'cheddar'],
    customizable: true,
    popular: true,
    preparationTime: '8-10 min',
    origin: 'Smash Style',
    nutritionScore: 'C'
  },
  {
    id: 'smash-chili-cheese',
    name: 'Smash Chili Cheese',
    description: 'Smashed beef patty with chili cheese sauce',
    basePrice: 7.90,
    image: '/images/smash chilli cheese burger.jpeg',
    category: 'Burgers',
    restaurantId: 'burger',
    dietaryInfo: { vegetarian: false, vegan: false, glutenFree: false, spicy: 2, halal: true },
    allergens: ['gluten', 'dairy'],
    calories: 620,
    protein: 27,
    carbs: 47,
    fat: 36,
    ingredients: ['beef', 'cheddar', 'jalapenos'],
    customizable: true,
    popular: true,
    preparationTime: '8-12 min',
    origin: 'Spicy Smash',
    nutritionScore: 'C'
  }
];

export default {
  menuItems: mrHappyBurgerMenuItems,
  ingredients: burgerIngredients
};
