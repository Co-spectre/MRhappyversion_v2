# MRhappy Restaurant Platform v2 🍕

A comprehensive multi-restaurant ordering system with advanced authentication, real-time tracking, and modern web technologies.

## 🎯 Project Overview

MRhappy is a full-stack restaurant platform that enables users to browse multiple restaurants, customize orders, track deliveries, and manage their dining experience. Built with modern technologies and enterprise-grade security.

## 🚀 Technologies Used

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Lucide React** for optimized icons
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **ES Modules** for modern JavaScript
- **JWT Authentication** with refresh tokens
- **bcryptjs** for password hashing
- **Express Rate Limiting** for security
- **Helmet.js** for security headers
- **CORS** configuration

### Database
- **MongoDB** on port 27018
- **Mongoose** ODM with schema validation
- **Comprehensive data models** for all entities
- **Optimized indexes** for performance

## 🗄️ Database Architecture

The MRhappy platform uses MongoDB with the following comprehensive collections:

### 👥 Users Collection
- **Authentication System**: Email/password with JWT tokens
- **User Profiles**: Personal information, preferences, addresses
- **Security Features**: Email verification, password reset tokens
- **Loyalty Program**: Points system and rewards tracking
- **Privacy Compliance**: GDPR-compliant consent management

### 🏪 Restaurants Collection
- **Restaurant Profiles**: Name, description, cuisine type, ratings
- **Location Data**: Address, coordinates, delivery zones
- **Operating Hours**: Opening/closing times, special schedules
- **Contact Information**: Phone, email, social media links
- **Media Assets**: Logo, cover images, gallery photos

### 🍽️ Menu Items Collection
- **Detailed Menu Data**: Name, description, pricing, categories
- **Nutritional Information**: Calories, allergens, dietary preferences
- **Customization Options**: Ingredients, sizes, preparation methods
- **Availability**: Stock status, time-based availability
- **Media**: High-quality food images and videos

### 🛒 Orders Collection
- **Order Management**: Status tracking, timestamps, delivery info
- **Customer Data**: User details, delivery addresses, preferences
- **Payment Information**: Transaction details, payment methods
- **Order Items**: Detailed list with customizations and pricing
- **Delivery Tracking**: Real-time location and status updates

### 🎯 Additional Collections
- **Categories**: Food categories and subcategories
- **Ingredients**: Comprehensive ingredient database with allergen info
- **Promotions**: Discount codes, special offers, loyalty rewards
- **Reviews**: Customer feedback and ratings system
- **Analytics**: Usage statistics and performance metrics

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running on port 27018)
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Co-spectre/MRhappyversion_v2.git
cd MRhappyversion_v2
```

2. **Setup Backend:**
```bash
cd MRhappywebsite/backend
npm install
npm run db:seed  # Populate database with sample data
npm start        # Start on port 5000
```

3. **Setup Frontend:**
```bash
cd ../project
npm install
npm run dev      # Start on port 5173
```

4. **Setup Database:**
```bash
# Ensure MongoDB is running on port 27018
mongod --port 27018 --dbpath C:\data\mrhappy
```

## 🎯 Features Implemented

### ✅ Authentication System
- User registration with email verification
- Secure login with JWT tokens
- Password reset functionality
- Refresh token rotation
- Rate limiting for security
- GDPR compliance features

### ✅ Restaurant Management
- Multi-restaurant support
- Dynamic menu loading
- Real-time availability updates
- Advanced filtering and search
- Category-based organization

### ✅ Order System
- Shopping cart with customizations
- Order tracking and history
- Multiple payment methods
- Delivery address management
- Order status notifications

### ✅ User Experience
- Responsive design for all devices
- Real-time updates and notifications
- Favorites and wishlist
- Loyalty points system
- Multi-language support

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent brute force attacks
- **Input Validation** with express-validator
- **CORS Protection** with proper configuration
- **Security Headers** via Helmet.js
- **MongoDB Injection Protection**

## 📊 Database Schema

### User Schema
```javascript
{
  email: String (required, unique),
  password: String (hashed),
  name: String,
  phone: String,
  role: String (customer/admin),
  isActive: Boolean,
  isEmailVerified: Boolean,
  dataProcessingConsent: Boolean,
  loyaltyPoints: Number,
  addresses: [AddressSchema],
  favoriteItems: [ObjectId],
  refreshTokens: [TokenSchema],
  // ... additional fields
}
```

### Restaurant Schema
```javascript
{
  name: String,
  description: String,
  cuisine: [String],
  location: LocationSchema,
  rating: Number,
  priceRange: String,
  isActive: Boolean,
  operatingHours: HoursSchema,
  // ... additional fields
}
```

### Order Schema
```javascript
{
  userId: ObjectId,
  restaurantId: ObjectId,
  items: [OrderItemSchema],
  totalAmount: Number,
  status: String,
  deliveryAddress: AddressSchema,
  paymentDetails: PaymentSchema,
  timestamps: TimestampSchema,
  // ... additional fields
}
```

## 🚀 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile

### Restaurants
- `GET /restaurants` - List all restaurants
- `GET /restaurants/:id` - Get restaurant details
- `GET /restaurants/:id/menu` - Get restaurant menu

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update order status

## 🔗 MongoDB Compass Connection

To view the database in MongoDB Compass:
1. **Connection String:** `mongodb://localhost:27018`
2. **Database Name:** `mrhappy`
3. **Collections:** users, restaurants, orders, categories, ingredients

## 📈 Performance Optimizations

- **Vite Build Optimization** for faster loading
- **Icon Tree Shaking** to reduce bundle size
- **MongoDB Indexing** for query performance
- **Lazy Loading** for components
- **Caching Strategies** for API responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the robust database
- Lucide team for beautiful icons
- Tailwind CSS team for the utility-first CSS framework

---

**MRhappy Restaurant Platform** - Bringing culinary experiences to your fingertips! 🍕🚀
