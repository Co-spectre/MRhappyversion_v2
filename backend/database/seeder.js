// MongoDB Database Seeder for MRhappy Restaurant Platform
// Populates the database with initial data for development and testing

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { database } from './connection.js';
import { User, Restaurant, MenuItem, Order, Inventory, Analytics } from './mongodb-schema.js';

class DatabaseSeeder {
  constructor() {
    this.users = [];
    this.restaurants = [];
    this.menuItems = [];
  }

  async seed() {
    try {
      console.log('🌱 Starting database seeding...');

      // Connect to database
      await database.connect();

      // Clear existing data (development only)
      if (process.env.NODE_ENV === 'development') {
        await this.clearDatabase();
      }

      // Seed data in order
      await this.seedUsers();
      await this.seedRestaurants();
      await this.seedMenuItems();
      await this.seedOrders();
      await this.seedInventory();

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async clearDatabase() {
    console.log('🗑️ Clearing existing data...');
    
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await Inventory.deleteMany({});
    await Analytics.deleteMany({});
    
    console.log('✅ Database cleared');
  }

  async seedUsers() {
    console.log('👥 Seeding users...');

    const userData = [
      {
        email: 'admin@mrhappy.com',
        password: 'Admin123!',
        name: 'System Administrator',
        phone: '+49 421 123 4567',
        role: 'admin',
        isEmailVerified: true,
        addresses: [{
          name: 'Office',
          street: 'Bürgermeister-Smidt-Straße 10',
          city: 'Bremen',
          postalCode: '28195',
          country: 'Germany',
          isDefault: true
        }],
        loyaltyPoints: 0,
        dataProcessingConsent: true,
        marketingConsent: true
      },
      {
        email: 'manager@mrhappy.com',
        password: 'Manager123!',
        name: 'Restaurant Manager',
        phone: '+49 421 234 5678',
        role: 'manager',
        isEmailVerified: true,
        addresses: [{
          name: 'Home',
          street: 'Am Wall 15',
          city: 'Bremen',
          postalCode: '28195',
          country: 'Germany',
          isDefault: true
        }],
        loyaltyPoints: 150,
        dataProcessingConsent: true,
        marketingConsent: true
      },
      {
        email: 'customer1@example.com',
        password: 'Customer123!',
        name: 'Max Mustermann',
        phone: '+49 421 345 6789',
        role: 'customer',
        isEmailVerified: true,
        addresses: [
          {
            name: 'Home',
            street: 'Schwachhauser Heerstraße 267',
            city: 'Bremen',
            postalCode: '28213',
            country: 'Germany',
            isDefault: true,
            deliveryInstructions: '2nd floor, ring twice'
          },
          {
            name: 'Work',
            street: 'Domsheide 15',
            city: 'Bremen',
            postalCode: '28195',
            country: 'Germany',
            isDefault: false
          }
        ],
        loyaltyPoints: 250,
        dietaryPreferences: ['vegetarian'],
        allergens: ['nuts'],
        dataProcessingConsent: true,
        marketingConsent: true
      },
      {
        email: 'customer2@example.com',
        password: 'Customer123!',
        name: 'Anna Schmidt',
        phone: '+49 421 456 7890',
        role: 'customer',
        isEmailVerified: true,
        addresses: [{
          name: 'Home',
          street: 'Ostertorsteinweg 45',
          city: 'Bremen',
          postalCode: '28203',
          country: 'Germany',
          isDefault: true
        }],
        loyaltyPoints: 180,
        dietaryPreferences: ['vegan', 'gluten-free'],
        dataProcessingConsent: true,
        marketingConsent: false
      },
      {
        email: 'delivery@mrhappy.com',
        password: 'Delivery123!',
        name: 'Hans Weber',
        phone: '+49 421 567 8901',
        role: 'delivery',
        isEmailVerified: true,
        addresses: [{
          name: 'Home',
          street: 'Wachmannstraße 12',
          city: 'Bremen',
          postalCode: '28209',
          country: 'Germany',
          isDefault: true
        }],
        dataProcessingConsent: true
      }
    ];

    this.users = await User.insertMany(userData);
    console.log(`✅ Created ${this.users.length} users`);
  }

  async seedRestaurants() {
    console.log('🏪 Seeding restaurants...');

    const restaurantData = [
      {
        name: 'Mr. Happy Döner',
        type: 'doner',
        description: 'Authentic Turkish döner kebabs made with fresh ingredients and traditional spices',
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=500&q=80',
        specialties: ['Döner Kebab', 'Lahmacun', 'Turkish Pizza'],
        location: 'Bremen Mitte',
        address: {
          street: 'Sögestraße 15',
          city: 'Bremen',
          postalCode: '28195',
          country: 'Germany',
          coordinates: { lat: 53.0759, lng: 8.8077 }
        },
        phone: '+49 421 123 4567',
        email: 'doner@mrhappy.com',
        openingHours: {
          monday: '11:00 - 22:00',
          tuesday: '11:00 - 22:00',
          wednesday: '11:00 - 22:00',
          thursday: '11:00 - 22:00',
          friday: '11:00 - 23:00',
          saturday: '11:00 - 23:00',
          sunday: '12:00 - 22:00'
        },
        deliveryFee: 2.50,
        deliveryTime: '25-35 min',
        deliveryZones: [
          {
            name: 'Bremen Mitte',
            postalCodes: ['28195', '28203', '28205'],
            fee: 2.50,
            minimumOrder: 15.00
          },
          {
            name: 'Bremen Nord',
            postalCodes: ['28213', '28215'],
            fee: 3.50,
            minimumOrder: 20.00
          }
        ],
        rating: 4.6,
        totalRatings: 387,
        isActive: true,
        acceptingOrders: true
      },
      {
        name: 'Mr. Happy Burger',
        type: 'burger',
        description: 'Gourmet burgers crafted with premium beef and fresh local ingredients',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
        specialties: ['Signature Burger', 'Crispy Chicken', 'Sweet Potato Fries'],
        location: 'Bremen Neustadt',
        address: {
          street: 'Buntentorsteinweg 89',
          city: 'Bremen',
          postalCode: '28201',
          country: 'Germany',
          coordinates: { lat: 53.0648, lng: 8.7980 }
        },
        phone: '+49 421 234 5678',
        email: 'burger@mrhappy.com',
        openingHours: {
          monday: '12:00 - 22:00',
          tuesday: '12:00 - 22:00',
          wednesday: '12:00 - 22:00',
          thursday: '12:00 - 22:00',
          friday: '12:00 - 23:00',
          saturday: '12:00 - 23:00',
          sunday: '13:00 - 21:00'
        },
        deliveryFee: 3.00,
        deliveryTime: '30-40 min',
        deliveryZones: [
          {
            name: 'Bremen Neustadt',
            postalCodes: ['28201', '28203'],
            fee: 3.00,
            minimumOrder: 18.00
          }
        ],
        rating: 4.8,
        totalRatings: 542,
        isActive: true,
        acceptingOrders: true
      },
      {
        name: 'Mr. Happy Fine Dining',
        type: 'restaurant',
        description: 'Elegant fine dining experience with modern European cuisine and exceptional service',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=500&q=80',
        specialties: ['Tasting Menu', 'Wine Pairing', 'Seasonal Specials'],
        location: 'Bremen Schwachhausen',
        address: {
          street: 'Schwachhauser Heerstraße 267',
          city: 'Bremen',
          postalCode: '28213',
          country: 'Germany',
          coordinates: { lat: 53.0892, lng: 8.8343 }
        },
        phone: '+49 421 345 6789',
        email: 'restaurant@mrhappy.com',
        openingHours: {
          monday: 'Closed',
          tuesday: '18:00 - 23:00',
          wednesday: '18:00 - 23:00',
          thursday: '18:00 - 23:00',
          friday: '18:00 - 24:00',
          saturday: '18:00 - 24:00',
          sunday: '17:00 - 22:00'
        },
        deliveryFee: 0, // No delivery for fine dining
        deliveryTime: 'Pickup only',
        rating: 4.9,
        totalRatings: 198,
        isActive: true,
        acceptingOrders: true
      }
    ];

    this.restaurants = await Restaurant.insertMany(restaurantData);
    console.log(`✅ Created ${this.restaurants.length} restaurants`);
  }

  async seedMenuItems() {
    console.log('🍽️ Seeding menu items...');

    // Find restaurants for references
    const donerRestaurant = this.restaurants.find(r => r.type === 'doner');
    const burgerRestaurant = this.restaurants.find(r => r.type === 'burger');
    const fineRestaurant = this.restaurants.find(r => r.type === 'restaurant');

    const menuItemsData = [
      // Döner Restaurant Items
      {
        name: 'Classic Döner Kebab',
        description: 'Traditional döner with seasoned lamb and chicken, fresh vegetables, and our signature sauce',
        basePrice: 7.50,
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=500&q=80',
        category: 'main',
        restaurantId: donerRestaurant._id,
        dietaryInfo: {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          halal: true,
          spicy: 2,
          calories: 650,
          protein: 35,
          carbs: 45,
          fat: 28
        },
        allergens: ['gluten', 'dairy'],
        ingredients: ['döner meat', 'pita bread', 'tomatoes', 'onions', 'lettuce', 'yogurt sauce'],
        customizable: true,
        customizationOptions: [
          {
            category: 'sauce',
            name: 'Garlic Sauce',
            basePrice: 0,
            extraPrice: 0.50,
            doublePrice: 1.00
          },
          {
            category: 'vegetable',
            name: 'Extra Tomatoes',
            basePrice: 0,
            extraPrice: 0.50
          },
          {
            category: 'protein',
            name: 'Extra Meat',
            basePrice: 0,
            extraPrice: 2.50,
            isPremium: true
          }
        ],
        available: true,
        preparationTime: '8-12 min',
        popular: true,
        orderCount: 1250,
        rating: 4.7
      },
      {
        name: 'Vegetarian Döner',
        description: 'Delicious vegetarian alternative with grilled halloumi and fresh vegetables',
        basePrice: 6.50,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=500&q=80',
        category: 'main',
        restaurantId: donerRestaurant._id,
        dietaryInfo: {
          vegetarian: true,
          vegan: false,
          glutenFree: false,
          halal: true,
          spicy: 1,
          calories: 480,
          protein: 18,
          carbs: 52,
          fat: 22
        },
        allergens: ['gluten', 'dairy'],
        ingredients: ['halloumi cheese', 'pita bread', 'grilled vegetables', 'herb sauce'],
        customizable: true,
        available: true,
        preparationTime: '8-12 min',
        popular: false,
        orderCount: 320,
        rating: 4.4
      },

      // Burger Restaurant Items
      {
        name: 'Mr. Happy Signature Burger',
        description: 'Our famous beef burger with special sauce, aged cheddar, crispy bacon, and fresh toppings',
        basePrice: 12.90,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
        category: 'main',
        restaurantId: burgerRestaurant._id,
        dietaryInfo: {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          halal: false,
          spicy: 2,
          calories: 820,
          protein: 42,
          carbs: 48,
          fat: 45
        },
        allergens: ['gluten', 'dairy', 'eggs'],
        ingredients: ['beef patty', 'brioche bun', 'cheddar cheese', 'bacon', 'lettuce', 'tomato', 'special sauce'],
        customizable: true,
        customizationOptions: [
          {
            category: 'protein',
            name: 'Extra Patty',
            basePrice: 0,
            extraPrice: 4.50,
            isPremium: true
          },
          {
            category: 'cheese',
            name: 'Swiss Cheese',
            basePrice: 0,
            extraPrice: 1.00
          },
          {
            category: 'topping',
            name: 'Crispy Onions',
            basePrice: 0,
            extraPrice: 0.75
          }
        ],
        available: true,
        preparationTime: '12-15 min',
        popular: true,
        orderCount: 890,
        rating: 4.8
      },
      {
        name: 'Crispy Chicken Burger',
        description: 'Buttermilk fried chicken breast with coleslaw and spicy mayo',
        basePrice: 11.50,
        image: 'https://images.unsplash.com/photo-1606755962773-d324e2d53dff?auto=format&fit=crop&w=500&q=80',
        category: 'main',
        restaurantId: burgerRestaurant._id,
        dietaryInfo: {
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          halal: true,
          spicy: 3,
          calories: 720,
          protein: 38,
          carbs: 52,
          fat: 35
        },
        allergens: ['gluten', 'dairy', 'eggs'],
        ingredients: ['chicken breast', 'brioche bun', 'coleslaw', 'spicy mayo', 'pickles'],
        customizable: true,
        available: true,
        preparationTime: '10-14 min',
        popular: true,
        orderCount: 650,
        rating: 4.6
      },

      // Fine Dining Restaurant Items
      {
        name: 'Pan-Seared Salmon',
        description: 'Fresh Atlantic salmon with quinoa risotto, seasonal vegetables, and lemon herb sauce',
        basePrice: 28.50,
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=500&q=80',
        category: 'main',
        restaurantId: fineRestaurant._id,
        dietaryInfo: {
          vegetarian: false,
          vegan: false,
          glutenFree: true,
          halal: false,
          spicy: 0,
          calories: 520,
          protein: 45,
          carbs: 28,
          fat: 24
        },
        allergens: ['fish'],
        ingredients: ['salmon fillet', 'quinoa', 'seasonal vegetables', 'lemon', 'herbs'],
        customizable: false,
        available: true,
        preparationTime: '20-25 min',
        popular: true,
        orderCount: 145,
        rating: 4.9,
        origin: 'Nordic Cuisine',
        nutritionScore: 'A'
      },
      {
        name: 'Beef Tenderloin',
        description: 'Premium beef tenderloin with truffle mashed potatoes and red wine reduction',
        basePrice: 38.00,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80',
        category: 'main',
        restaurantId: fineRestaurant._id,
        dietaryInfo: {
          vegetarian: false,
          vegan: false,
          glutenFree: true,
          halal: false,
          spicy: 0,
          calories: 680,
          protein: 52,
          carbs: 22,
          fat: 42
        },
        allergens: ['dairy'],
        ingredients: ['beef tenderloin', 'potatoes', 'truffle', 'red wine', 'herbs'],
        customizable: false,
        available: true,
        preparationTime: '25-30 min',
        popular: true,
        orderCount: 98,
        rating: 5.0,
        origin: 'French Cuisine',
        nutritionScore: 'B'
      }
    ];

    this.menuItems = await MenuItem.insertMany(menuItemsData);
    console.log(`✅ Created ${this.menuItems.length} menu items`);
  }

  async seedOrders() {
    console.log('📦 Seeding sample orders...');

    const customer = this.users.find(u => u.role === 'customer');
    const restaurant = this.restaurants[0];
    const menuItem = this.menuItems[0];

    const orderData = [
      {
        userId: customer._id,
        restaurantId: restaurant._id,
        items: [{
          menuItemId: menuItem._id,
          name: menuItem.name,
          quantity: 2,
          basePrice: menuItem.basePrice,
          customizations: [
            { category: 'sauce', name: 'Extra Garlic Sauce', price: 0.50 }
          ],
          itemTotal: menuItem.basePrice * 2 + 0.50
        }],
        subtotal: menuItem.basePrice * 2 + 0.50,
        tax: (menuItem.basePrice * 2 + 0.50) * 0.19,
        deliveryFee: restaurant.deliveryFee,
        tip: 2.00,
        total: (menuItem.basePrice * 2 + 0.50) * 1.19 + restaurant.deliveryFee + 2.00,
        orderType: 'delivery',
        status: 'completed',
        deliveryAddress: customer.addresses[0],
        paymentMethod: 'card',
        paymentStatus: 'completed',
        customerInfo: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email
        },
        completedTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        rating: 5,
        review: 'Excellent food and fast delivery!'
      }
    ];

    await Order.insertMany(orderData);
    console.log(`✅ Created ${orderData.length} sample orders`);
  }

  async seedInventory() {
    console.log('📦 Seeding inventory...');

    const restaurant = this.restaurants[0];

    const inventoryData = [
      {
        restaurantId: restaurant._id,
        name: 'Döner Meat',
        category: 'ingredient',
        currentStock: 25,
        unit: 'kg',
        minimumStock: 5,
        supplier: {
          name: 'Fresh Meat Co.',
          contact: '+49 421 987 6543',
          email: 'orders@freshmeat.de'
        },
        costPerUnit: 12.50,
        lastPurchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        lastPurchaseQuantity: 30
      },
      {
        restaurantId: restaurant._id,
        name: 'Pita Bread',
        category: 'ingredient',
        currentStock: 200,
        unit: 'pieces',
        minimumStock: 50,
        supplier: {
          name: 'Bremen Bakery',
          contact: '+49 421 876 5432',
          email: 'wholesale@bremenbakery.de'
        },
        costPerUnit: 0.45,
        lastPurchaseDate: new Date(),
        lastPurchaseQuantity: 300
      }
    ];

    await Inventory.insertMany(inventoryData);
    console.log(`✅ Created ${inventoryData.length} inventory items`);
  }
}

// Export seeder class and run function
const seeder = new DatabaseSeeder();

async function runSeeder() {
  try {
    await seeder.seed();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeder if called directly
if (require.main === module) {
  runSeeder();
}

module.exports = { DatabaseSeeder, runSeeder };
