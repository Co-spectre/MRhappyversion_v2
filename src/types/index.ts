export interface Restaurant {
  id: string;
  name: string;
  type: 'doner' | 'burger' | 'restaurant';
  description: string;
  image: string;
  specialties: string[];
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  location: string;
  phone: string;
  address: string;
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

export interface Ingredient {
  id: string;
  name: string;
  basePrice: number;
  extraPrice: number;
  doublePrice: number;
  category: 'protein' | 'vegetable' | 'sauce' | 'cheese' | 'topping' | 'side';
  isPremium: boolean;
  image?: string;
  description?: string;
  allergens?: string[];
}

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
    halal?: boolean;
  };
  allergens: string[];
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  ingredients: string[];
  customizable: boolean;
  popular: boolean;
  preparationTime?: string;
  origin?: string;
  nutritionScore?: 'A' | 'B' | 'C' | 'D' | 'E';
  chefRecommended?: boolean;
  localSpecialty?: boolean;
  winePairing?: string;
  onlineDiscount?: {
    percentage: number;
    originalPrice: number;
  };
  sizes?: {
    name: string;
    priceMultiplier: number;
  }[];
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedSize?: string;
  customizations: {
    ingredientId: string;
    action: 'add' | 'remove' | 'extra' | 'double';
    price: number;
  }[];
  specialInstructions?: string;
  totalPrice: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: Address[];
  favoriteItems: string[];
  loyaltyPoints: number;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderType: 'pickup';
  scheduledTime?: Date;
  pickupLocation?: string;
  estimatedTime?: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: Address[];
  favoriteItems: string[];
  loyaltyPoints: number;
  createdAt: Date;
  role?: 'customer' | 'admin' | 'manager';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  permissions: AdminPermission[];
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

export interface AdminPermission {
  resource: 'orders' | 'inventory' | 'users' | 'analytics' | 'settings';
  actions: ('read' | 'write' | 'delete' | 'manage')[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastRestocked: Date;
  expiryDate?: Date;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  popularItems: {
    id: string;
    name: string;
    orderCount: number;
    revenue: number;
  }[];
  ordersByStatus: {
    status: Order['status'];
    count: number;
  }[];
  revenueByDay: {
    date: string;
    revenue: number;
    orderCount: number;
  }[];
}