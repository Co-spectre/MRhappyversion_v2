# 🏪 Multi-Restaurant Admin System - Implementation Plan

**Date:** October 15, 2025  
**Status:** Planning Phase  
**Goal:** Separate admin panels for each restaurant location

---

## 📋 **CURRENT SITUATION ANALYSIS**

### ✅ **What's Already Working:**

1. **Single Admin Panel** (`AdminDashboard.tsx`)
   - Shows all orders from ALL restaurants
   - Admin login: `admin@mrhappy.com` / `admin123`
   - Role: `'admin'` (super admin)

2. **Order System** (`OrderContext.tsx`)
   - Orders have `restaurantId` field
   - Can track which restaurant an order belongs to

3. **Three Restaurants:**
   - **Vegesack (Kaufland)**: `'doner'` + `'burger'` 
   - **Schwanewede**: `'doner-pizza'`

### ❌ **What's Missing:**

1. **No Restaurant-Specific Admins**
   - No separate logins for each restaurant
   - No `'restaurant-admin'` role
   - No restaurant filtering in admin panel

2. **No Restaurant ID in Orders**
   - Need to add `restaurantId` to Order type
   - Need to auto-detect restaurant from cart items

3. **No Separate Admin Views**
   - All admins see all orders (no filtering by restaurant)

---

## 🎯 **SOLUTION: 3-TIER ADMIN SYSTEM**

### **Tier 1: Super Admin** (Existing)
- **Email:** `admin@mrhappy.com`
- **Password:** `admin123`
- **Role:** `'admin'`
- **Access:** ALL restaurants, ALL orders
- **Features:** Can see everything, manage all locations

### **Tier 2: Restaurant Admins** (NEW)
- **Döner Restaurant (Vegesack):**
  - Email: `doner@mrhappy.de`
  - Password: `doner123`
  - Restaurant ID: `'doner'`
  - Sees: Only döner orders
  
- **Burger Restaurant (Vegesack):**
  - Email: `burger@mrhappy.de`
  - Password: `burger123`
  - Restaurant ID: `'burger'`
  - Sees: Only burger orders
  
- **Pizza & Döner (Schwanewede):**
  - Email: `pizza@mrhappy.de`
  - Password: `pizza123`
  - Restaurant ID: `'doner-pizza'`
  - Sees: Only doner-pizza orders

### **Tier 3: Customers** (Existing)
- **Role:** `'customer'`
- **Access:** Can only order and view their own orders

---

## 🔧 **IMPLEMENTATION STEPS**

### **Step 1: Update Type Definitions** ✅
**File:** `src/types/index.ts`

Add new types:
```typescript
export interface RestaurantAdmin {
  id: string;
  restaurantId: 'doner' | 'burger' | 'doner-pizza';
  restaurantName: string;
  email: string;
  password: string; // In production, this would be hashed
  location: string;
  phone: string;
  stripeAccountId?: string; // For split payments
}

export const RESTAURANT_ADMINS: RestaurantAdmin[] = [
  {
    id: 'admin-doner',
    restaurantId: 'doner',
    restaurantName: 'Mr. Happy Döner (Vegesack)',
    email: 'doner@mrhappy.de',
    password: 'doner123',
    location: 'Zum Alten Speicher 1, 28759 Bremen',
    phone: '04209/8989990'
  },
  {
    id: 'admin-burger',
    restaurantId: 'burger',
    restaurantName: 'Mr. Happy Burger (Vegesack)',
    email: 'burger@mrhappy.de',
    password: 'burger123',
    location: 'Zum Alten Speicher 1, 28759 Bremen',
    phone: '04209/8989990'
  },
  {
    id: 'admin-pizza',
    restaurantId: 'doner-pizza',
    restaurantName: 'Mr. Happy Döner & Pizza (Schwanewede)',
    email: 'pizza@mrhappy.de',
    password: 'pizza123',
    location: 'Heidkamp 25, 28790 Schwanewede',
    phone: '042098989992'
  }
];
```

Update AuthUser:
```typescript
export interface AuthUser {
  // ... existing fields
  role?: 'customer' | 'admin' | 'restaurant-admin'; // Add 'restaurant-admin'
  restaurantId?: 'doner' | 'burger' | 'doner-pizza'; // NEW: For restaurant admins
}
```

Update Order:
```typescript
export interface Order {
  // ... existing fields
  restaurantId: 'doner' | 'burger' | 'doner-pizza'; // NEW: Track which restaurant
}
```

---

### **Step 2: Update Authentication** ✅
**File:** `src/context/AuthContext.tsx`

Add restaurant admin authentication:
```typescript
const login = async (email: string, password: string): Promise<boolean> => {
  // ... existing code
  
  // Check for restaurant admin
  const restaurantAdmin = RESTAURANT_ADMINS.find(
    admin => admin.email === email && admin.password === password
  );
  
  if (restaurantAdmin) {
    user = {
      id: restaurantAdmin.id,
      email: restaurantAdmin.email,
      name: restaurantAdmin.restaurantName,
      phone: restaurantAdmin.phone,
      addresses: [],
      favoriteItems: [],
      loyaltyPoints: 0,
      createdAt: new Date(),
      role: 'restaurant-admin',
      restaurantId: restaurantAdmin.restaurantId
    };
  }
  
  // ... rest of login logic
};
```

---

### **Step 3: Add Restaurant ID to Orders** ✅
**File:** `src/context/OrderContext.tsx`

Auto-detect restaurant from cart items:
```typescript
const placeOrder = async (orderData: OrderFormData) => {
  // Detect restaurant from first cart item
  const restaurantId: 'doner' | 'burger' | 'doner-pizza' = 
    items.length > 0 && items[0].menuItem.restaurantId 
      ? items[0].menuItem.restaurantId as 'doner' | 'burger' | 'doner-pizza'
      : 'doner'; // fallback

  const order: Order = {
    // ... existing fields
    restaurantId, // NEW: Add restaurant ID
    // ... rest of order data
  };
};
```

---

### **Step 4: Filter Orders by Restaurant** ✅
**File:** `src/context/AdminContext.tsx`

Add restaurant filtering:
```typescript
interface AdminState {
  // ... existing fields
  restaurantId: string | null; // NEW: Current restaurant filter
}

// Add action
type AdminAction =
  | { type: 'SET_RESTAURANT'; payload: string | null }
  | // ... existing actions

// Add reducer case
case 'SET_RESTAURANT':
  return { ...state, restaurantId: action.payload };

// Add filter function
const getFilteredOrders = (): Order[] => {
  let filtered = state.orders;
  
  // Filter by restaurant first (if restaurant admin)
  if (state.restaurantId) {
    filtered = filtered.filter(order => order.restaurantId === state.restaurantId);
  }
  
  // Then apply other filters (status, search, date range)
  // ... existing filter logic
  
  return filtered;
};
```

---

### **Step 5: Update Admin Dashboard** ✅
**File:** `src/components/AdminDashboard.tsx`

Add restaurant detection on mount:
```typescript
export function AdminDashboard({ onNavigateBack }: AdminDashboardProps) {
  const { state: authState } = useAuth();
  const { state: adminState, setRestaurant } = useAdmin();
  
  useEffect(() => {
    // If restaurant admin, filter by their restaurant
    if (authState.user?.role === 'restaurant-admin' && authState.user.restaurantId) {
      setRestaurant(authState.user.restaurantId);
    } else {
      // Super admin sees all
      setRestaurant(null);
    }
  }, [authState.user]);
  
  return (
    <div>
      {/* Show restaurant name in header if filtered */}
      {adminState.restaurantId && (
        <div className="bg-blue-900/30 p-3 border-b border-blue-600">
          <p className="text-blue-300 text-sm text-center">
            📍 Viewing orders for: <strong>{getRestaurantName(adminState.restaurantId)}</strong>
          </p>
        </div>
      )}
      
      {/* Rest of dashboard */}
    </div>
  );
}
```

---

### **Step 6: Update App.tsx Protection** ✅
**File:** `src/App.tsx`

Allow restaurant admins access:
```typescript
useEffect(() => {
  // Protect admin panel
  if (currentView === 'admin') {
    const user = authState.user;
    const canAccess = user && (user.role === 'admin' || user.role === 'restaurant-admin');
    
    if (!canAccess) {
      setCurrentView('home');
    }
  }
}, [currentView, authState.user]);
```

---

### **Step 7: Update Header Access** ✅
**File:** `src/components/Header.tsx`

Show Admin Panel link for restaurant admins:
```typescript
{authState.user && (authState.user.role === 'admin' || authState.user.role === 'restaurant-admin') && (
  <button
    onClick={() => onNavigate?.('admin')}
    className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
  >
    <ShieldCheck className="w-5 h-5" />
    <span>Admin Panel</span>
  </button>
)}
```

---

## 🎨 **USER EXPERIENCE FLOW**

### **For Restaurant Admins:**

```
1. Go to website
2. Click "Login"
3. Enter: doner@mrhappy.de / doner123
4. Login successful → Role: 'restaurant-admin'
5. See "Admin Panel" link in header
6. Click "Admin Panel"
7. Dashboard shows:
   ✅ Only döner orders
   ✅ Restaurant name in header: "Mr. Happy Döner (Vegesack)"
   ✅ Can update order status
   ✅ Cannot see other restaurants' orders
```

### **For Super Admin:**

```
1. Login: admin@mrhappy.com / admin123
2. Role: 'admin'
3. Admin Panel shows:
   ✅ ALL orders from ALL restaurants
   ✅ Optional restaurant filter dropdown
   ✅ Can see everything
```

---

## 📊 **ORDER ROUTING LOGIC**

### **How Orders Get to Right Restaurant:**

```typescript
// When customer adds items to cart
1. User selects "Mr. Happy Burger"
2. Adds "Cheeseburger" (restaurantId: 'burger')
3. Cart items all have: menuItem.restaurantId = 'burger'

// When order is placed
4. OrderContext detects: restaurantId = 'burger' (from cart items)
5. Order created with: order.restaurantId = 'burger'
6. Saved to OrderGateway with restaurant ID

// When restaurant admin logs in
7. burger@mrhappy.de logs in
8. AuthContext sets: user.restaurantId = 'burger'
9. AdminContext filters: orders.filter(o => o.restaurantId === 'burger')
10. Admin only sees burger orders! ✅
```

---

## 🔐 **SECURITY CONSIDERATIONS**

### **Current Demo Mode:**
- Passwords stored in plain text (demo only)
- No real database (localStorage)
- No session tokens

### **Production Requirements:**
```typescript
// TODO for production:
1. Hash passwords (bcrypt)
2. Use JWT tokens
3. Store in secure database (MongoDB/PostgreSQL)
4. Add 2FA for admin accounts
5. Implement role-based permissions
6. Add audit logging
7. Stripe Connect for split payments
```

---

## 📝 **LOGIN CREDENTIALS SUMMARY**

### **Super Admin:**
```
Email: admin@mrhappy.com
Password: admin123
Access: ALL restaurants
```

### **Döner Admin:**
```
Email: doner@mrhappy.de
Password: doner123
Restaurant: Mr. Happy Döner (Vegesack)
Access: Only döner orders
```

### **Burger Admin:**
```
Email: burger@mrhappy.de
Password: burger123
Restaurant: Mr. Happy Burger (Vegesack)
Access: Only burger orders
```

### **Pizza Admin:**
```
Email: pizza@mrhappy.de
Password: pizza123
Restaurant: Mr. Happy Döner & Pizza (Schwanewede)
Access: Only doner-pizza orders
```

---

## 🧪 **TESTING CHECKLIST**

- [ ] Döner admin can only see döner orders
- [ ] Burger admin can only see burger orders
- [ ] Pizza admin can only see doner-pizza orders
- [ ] Super admin can see ALL orders
- [ ] Orders route to correct restaurant based on cart items
- [ ] Restaurant name shows in admin dashboard header
- [ ] Non-admins cannot access admin panel
- [ ] Login works for all 4 accounts
- [ ] Logout works properly
- [ ] Orders persist after refresh

---

## 🎯 **FILES TO CREATE/MODIFY**

### **Files to Modify:**
1. ✅ `src/types/index.ts` - Add RestaurantAdmin interface
2. ✅ `src/context/AuthContext.tsx` - Add restaurant admin login
3. ✅ `src/context/OrderContext.tsx` - Add restaurantId to orders
4. ✅ `src/context/AdminContext.tsx` - Add restaurant filtering
5. ✅ `src/components/AdminDashboard.tsx` - Show restaurant name
6. ✅ `src/App.tsx` - Allow restaurant-admin role
7. ✅ `src/components/Header.tsx` - Show admin link for restaurant-admin

### **Files to Create:**
8. ✅ `src/services/RestaurantAuth.ts` - Restaurant admin utilities
9. ✅ `src/components/RestaurantAdminLogin.tsx` - Separate login for admins (optional)

---

## 🚀 **READY TO IMPLEMENT?**

All planning is complete! Ready to:
1. Update type definitions
2. Modify authentication
3. Add order filtering
4. Update admin dashboard
5. Test all scenarios

**Estimated Time:** 30-45 minutes  
**Complexity:** Medium  
**Breaking Changes:** None (backward compatible)

---

**Next Step:** Shall I proceed with the implementation?

