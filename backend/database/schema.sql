# 🍃 MongoDB Database Setup for MRhappy Restaurant Platform

## 📋 Overview
This directory contains the complete MongoDB database setup including schemas, connection management, and initial data seeding for the MRhappy multi-restaurant platform.

## 🗂️ Database Structure

### Collections:
- **Users** - Customer accounts, admin users, staff management
- **Restaurants** - Restaurant information and settings
- **MenuItems** - Food items with customization options
- **Orders** - Order tracking and management
- **Inventory** - Stock management for restaurants
- **Analytics** - Business metrics and reporting data

## 🔧 Setup Instructions

### 1. Install MongoDB
```bash
# Option A: MongoDB Atlas (Cloud - Recommended)
# Sign up at https://www.mongodb.com/atlas
# Create a free cluster and get connection string

# Option B: Local MongoDB Installation
# Download from https://www.mongodb.com/try/download/community
# Follow platform-specific installation guide
```

### 2. Environment Configuration
Create a `.env` file in the backend root directory:
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mrhappy_restaurant
# OR for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/mrhappy_restaurant

# Database Settings
NODE_ENV=development
DB_NAME=mrhappy_restaurant
```

### 3. Install Dependencies
```bash
cd backend
npm install mongoose bcryptjs dotenv
```

### 4. Initialize Database
```bash
# Run the seeder to populate initial data
node database/seeder.js
```

## 📊 Schema Details

### User Schema Features:
- ✅ Password hashing with bcrypt
- ✅ Email verification system
- ✅ Password reset functionality
- ✅ Role-based access control
- ✅ Multiple delivery addresses
- ✅ Loyalty points system
- ✅ Dietary preferences & allergens
- ✅ GDPR compliance fields

### Restaurant Schema Features:
- ✅ Multi-location support
- ✅ Operating hours management
- ✅ Delivery zones with custom pricing
- ✅ Rating and review system
- ✅ Order acceptance controls

### MenuItem Schema Features:
- ✅ Extensive customization options
- ✅ Nutritional information
- ✅ Allergen tracking
- ✅ Availability management
- ✅ Popularity metrics

### Order Schema Features:
- ✅ Complete order lifecycle tracking
- ✅ Real-time status updates
- ✅ Payment integration ready
- ✅ Delivery tracking
- ✅ Customer feedback system

## 🚀 Usage Examples

### Connect to Database
```javascript
const { database } = require('./database/connection');

async function connectDB() {
  await database.connect();
  console.log('Connected to MongoDB!');
}
```

### Using Models
```javascript
const { User, Restaurant, MenuItem, Order } = require('./database/mongodb-schema');

// Create a new user
const user = new User({
  email: 'customer@example.com',
  password: 'SecurePassword123!',
  name: 'John Doe',
  role: 'customer'
});
await user.save();

// Find restaurants
const restaurants = await Restaurant.find({ type: 'burger' });

// Create an order
const order = new Order({
  userId: user._id,
  restaurantId: restaurant._id,
  items: [...],
  orderType: 'delivery'
});
await order.save();
```

## 🔒 Security Features

### Password Security:
- Bcrypt hashing with salt rounds
- Password complexity requirements
- Secure password reset tokens

### Data Validation:
- Mongoose schema validation
- Email format validation
- Phone number validation
- Required field enforcement

### Privacy Compliance:
- GDPR consent tracking
- Data processing consent
- Marketing consent management
- Right to deletion support

## 📈 Performance Optimizations

### Indexing Strategy:
```javascript
// Recommended indexes for production
db.users.createIndex({ email: 1 }, { unique: true })
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.menu_items.createIndex({ restaurantId: 1, category: 1 })
db.analytics.createIndex({ date: 1, restaurantId: 1 })
```

### Connection Pooling:
- Maximum 10 concurrent connections
- 5-second server selection timeout
- 45-second socket timeout
- IPv4 optimization

## 🧪 Development Data

The seeder creates:
- **5 Users** (Admin, Manager, Customers, Delivery)
- **3 Restaurants** (Döner, Burger, Fine Dining)
- **6 Menu Items** (2 per restaurant type)
- **1 Sample Order** (for testing)
- **2 Inventory Items** (for demo)

### Default Admin Credentials:
- **Email:** admin@mrhappy.com
- **Password:** Admin123!

### Test Customer:
- **Email:** customer1@example.com
- **Password:** Customer123!

## 🔍 Database Monitoring

### Health Check Endpoint:
```javascript
app.get('/api/health/database', async (req, res) => {
  const health = await database.healthCheck();
  res.json(health);
});
```

### Statistics:
```javascript
const stats = await database.getStats();
console.log('DB Stats:', stats);
```

## 🚨 Important Notes

1. **Production Security:**
   - Use MongoDB Atlas for production
   - Enable authentication and SSL
   - Set up proper backup strategies
   - Monitor database performance

2. **Environment Variables:**
   - Never commit `.env` files
   - Use different databases for dev/staging/prod
   - Rotate database passwords regularly

3. **Data Migration:**
   - Test migrations in staging first
   - Backup before major schema changes
   - Use MongoDB migration tools for production

## 📝 Next Steps

1. Set up the Express.js backend server
2. Create authentication middleware
3. Implement API endpoints
4. Connect frontend to real database
5. Set up automated testing
6. Deploy to production environment

This database setup provides a solid foundation for the MRhappy restaurant platform with room for future scalability and features! 🚀
