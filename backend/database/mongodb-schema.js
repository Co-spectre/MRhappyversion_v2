// MongoDB Schema Definitions for MRhappy Restaurant Platform
// Using Mongoose ODM for schema validation and structure

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ==========================================
// USER SCHEMA - Authentication & Profile
// ==========================================
const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't include in queries by default
  },
  
  // Profile information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Role-based access control
  role: {
    type: String,
    enum: ['customer', 'admin', 'manager', 'delivery'],
    default: 'customer'
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Customer specific data
  addresses: [{
    name: { type: String, required: true }, // Home, Work, etc.
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'Germany' },
    isDefault: { type: Boolean, default: false },
    deliveryInstructions: String
  }],
  
  // Loyalty program
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Preferences
  favoriteItems: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MenuItem' 
  }],
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher', 'dairy-free']
  }],
  allergens: [{
    type: String,
    enum: ['nuts', 'dairy', 'eggs', 'soy', 'wheat', 'fish', 'shellfish']
  }],
  
  // Privacy settings
  marketingConsent: {
    type: Boolean,
    default: false
  },
  dataProcessingConsent: {
    type: Boolean,
    required: true
  },
  
  // Timestamps
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// ==========================================
// RESTAURANT SCHEMA
// ==========================================
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['doner', 'burger', 'restaurant'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: String,
  specialties: [String],
  
  // Location & Contact
  location: {
    type: String,
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'Germany' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  phone: {
    type: String,
    required: true
  },
  email: String,
  website: String,
  
  // Operating hours
  openingHours: {
    monday: { type: String, default: 'Closed' },
    tuesday: { type: String, default: 'Closed' },
    wednesday: { type: String, default: 'Closed' },
    thursday: { type: String, default: 'Closed' },
    friday: { type: String, default: 'Closed' },
    saturday: { type: String, default: 'Closed' },
    sunday: { type: String, default: 'Closed' }
  },
  
  // Delivery settings
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  deliveryTime: {
    type: String,
    default: '30-45 min'
  },
  deliveryZones: [{
    name: String,
    postalCodes: [String],
    fee: Number,
    minimumOrder: Number
  }],
  
  // Restaurant metrics
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  acceptingOrders: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'restaurants'
});

// ==========================================
// MENU ITEM SCHEMA
// ==========================================
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  image: String,
  category: {
    type: String,
    required: true,
    enum: ['appetizer', 'main', 'side', 'dessert', 'drink', 'special']
  },
  
  // Restaurant reference
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  
  // Dietary information
  dietaryInfo: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    halal: { type: Boolean, default: true },
    spicy: { type: Number, min: 0, max: 5, default: 0 },
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  
  // Allergens
  allergens: [{
    type: String,
    enum: ['nuts', 'dairy', 'eggs', 'soy', 'wheat', 'fish', 'shellfish', 'gluten']
  }],
  
  // Ingredients & Customization
  ingredients: [String],
  customizable: {
    type: Boolean,
    default: false
  },
  customizationOptions: [{
    category: {
      type: String,
      enum: ['protein', 'vegetable', 'sauce', 'cheese', 'topping', 'side']
    },
    name: String,
    basePrice: { type: Number, default: 0 },
    extraPrice: { type: Number, default: 0 },
    doublePrice: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    available: { type: Boolean, default: true }
  }],
  
  // Availability
  available: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: String,
    default: '15-20 min'
  },
  
  // Popularity metrics
  popular: {
    type: Boolean,
    default: false
  },
  orderCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  // Additional info
  origin: String,
  nutritionScore: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E']
  }
}, {
  timestamps: true,
  collection: 'menu_items'
});

// ==========================================
// ORDER SCHEMA
// ==========================================
const orderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Customer reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Restaurant reference
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  
  // Order items
  items: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: String, // Cached for performance
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    basePrice: Number, // Price at time of order
    customizations: [{
      category: String,
      name: String,
      price: Number
    }],
    itemTotal: Number,
    specialInstructions: String
  }],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  tip: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    amount: { type: Number, default: 0 },
    code: String,
    reason: String
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Order details
  orderType: {
    type: String,
    enum: ['pickup', 'delivery', 'dine-in'],
    required: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'on-the-way', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Delivery information
  deliveryAddress: {
    name: String,
    street: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
    instructions: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Timing
  scheduledTime: Date,
  estimatedTime: Date,
  preparationStarted: Date,
  readyTime: Date,
  deliveryStarted: Date,
  completedTime: Date,
  
  // Payment
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'paypal', 'stripe'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String, // External payment reference
  
  // Customer information (cached)
  customerInfo: {
    name: String,
    phone: String,
    email: String
  },
  
  // Additional details
  specialInstructions: String,
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  },
  loyaltyPointsUsed: {
    type: Number,
    default: 0
  },
  
  // Tracking updates
  trackingUpdates: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    message: String,
    location: {
      lat: Number,
      lng: Number
    },
    estimatedTime: Number // minutes
  }],
  
  // Review & Rating
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String,
  reviewDate: Date
}, {
  timestamps: true,
  collection: 'orders'
});

// Generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `MR${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

// ==========================================
// INVENTORY SCHEMA
// ==========================================
const inventorySchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  category: {
    type: String,
    enum: ['ingredient', 'packaging', 'supply'],
    required: true
  },
  
  // Stock information
  currentStock: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'l', 'ml', 'pieces', 'boxes'],
    required: true
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Supplier information
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  
  // Cost tracking
  costPerUnit: Number,
  lastPurchaseDate: Date,
  lastPurchaseQuantity: Number,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'inventory'
});

// ==========================================
// ANALYTICS SCHEMA
// ==========================================
const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  
  // Daily metrics
  metrics: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    deliveryOrders: { type: Number, default: 0 },
    pickupOrders: { type: Number, default: 0 },
    dineInOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    averagePreparationTime: { type: Number, default: 0 },
    averageDeliveryTime: { type: Number, default: 0 }
  },
  
  // Popular items
  popularItems: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: Number,
    revenue: Number
  }],
  
  // Peak hours
  hourlyOrders: [{
    hour: Number, // 0-23
    orders: Number
  }]
}, {
  timestamps: true,
  collection: 'analytics'
});

// ==========================================
// EXPORT SCHEMAS
// ==========================================
module.exports = {
  User: mongoose.model('User', userSchema),
  Restaurant: mongoose.model('Restaurant', restaurantSchema),
  MenuItem: mongoose.model('MenuItem', menuItemSchema),
  Order: mongoose.model('Order', orderSchema),
  Inventory: mongoose.model('Inventory', inventorySchema),
  Analytics: mongoose.model('Analytics', analyticsSchema)
};
