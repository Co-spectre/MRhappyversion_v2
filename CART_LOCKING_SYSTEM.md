# 🔒 Cart Locking System - Single Restaurant Per Order

**Implementation Date:** October 15, 2025  
**Status:** ✅ **FULLY FUNCTIONAL**  
**Purpose:** Prevent users from ordering from multiple restaurants in one cart

---

## 🎯 **WHY THIS FEATURE?**

### **The Problem:**
- Your business has **3 separate restaurants** with **3 different Stripe accounts**
- Each restaurant needs payments to go to their own bank account
- Stripe Connect requires orders to be restaurant-specific
- Mixing items from different restaurants = payment routing nightmare

### **The Solution:**
- **Lock cart to ONE restaurant at a time**
- When user adds item from Restaurant A, they can ONLY add items from Restaurant A
- To order from Restaurant B, they must first complete or clear their Restaurant A order

---

## 🚀 **HOW IT WORKS**

### **User Flow:**

```
1. User browses menu (no restaurant locked yet)
   ↓
2. User adds "Cheeseburger" from Burger Restaurant
   ↓
   ✅ Cart locks to "Burger Restaurant"
   ↓
3. User tries to add "Döner Kebab" from Döner Restaurant
   ↓
   ⚠️ WARNING MODAL APPEARS:
   
   ┌─────────────────────────────────────────────────────┐
   │ ⚠️ Different Restaurant                            │
   │                                                     │
   │ You currently have items from Burger Restaurant    │
   │ in your cart.                                       │
   │                                                     │
   │ To add items from Döner Restaurant, you need to    │
   │ clear your current cart first.                     │
   │                                                     │
   │ 💡 Why? Each restaurant has its own payment        │
   │ account. You can only order from one restaurant    │
   │ at a time.                                          │
   │                                                     │
   │ [Cancel]  [Clear Cart & Switch]                    │
   └─────────────────────────────────────────────────────┘
   
   ↓
4. User clicks "Clear Cart & Switch"
   ↓
   ✅ Cart clears
   ✅ Locks to "Döner Restaurant"
   ✅ Döner Kebab added successfully
```

---

## 📁 **FILES MODIFIED**

### **1. `src/context/CartContext.tsx`**

#### **New State:**
```typescript
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string;
  discount: number;
  lockedRestaurantId: string | null; // NEW: Track locked restaurant
}
```

#### **New Actions:**
```typescript
type CartAction =
  | // ... existing actions
  | { type: 'SET_LOCKED_RESTAURANT'; payload: string | null }; // NEW
```

#### **New Functions:**
```typescript
// Check if item from restaurant can be added
canAddItemFromRestaurant: (restaurantId: string) => boolean;

// Clear cart and switch to new restaurant
clearCartAndSwitchRestaurant: (restaurantId: string) => void;

// Get currently locked restaurant
getLockedRestaurantId: () => string | null;
```

#### **Updated addToCart:**
```typescript
const addToCart = (menuItem: MenuItem, customizations: any[] = [], quantity: number = 1): { 
  success: boolean; 
  message?: string 
} => {
  // NEW: Check if cart is locked to a different restaurant
  if (state.lockedRestaurantId && state.lockedRestaurantId !== menuItem.restaurantId) {
    return {
      success: false,
      message: 'Your cart contains items from another restaurant.'
    };
  }
  
  // ... rest of add logic
  
  return { success: true };
};
```

---

### **2. `src/components/MenuItemCard.tsx`**

#### **New State:**
```typescript
const [showRestaurantWarning, setShowRestaurantWarning] = useState(false);
```

#### **Updated handleAddToCart:**
```typescript
const handleAddToCart = () => {
  // NEW: Check if cart is locked to a different restaurant
  if (!canAddItemFromRestaurant(item.restaurantId)) {
    setShowRestaurantWarning(true); // Show modal
    return;
  }
  
  // ... rest of add logic
};
```

#### **New Warning Modal:**
```tsx
{showRestaurantWarning && (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50">
    {/* Beautiful warning modal with:
        - Current restaurant name
        - Target restaurant name
        - Explanation
        - [Cancel] and [Clear Cart & Switch] buttons
    */}
  </div>
)}
```

---

### **3. `src/components/CartSidebar.tsx`**

#### **New Restaurant Banner:**
```tsx
{/* Restaurant Lock Banner */}
{getLockedRestaurantId() && (
  <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40">
    <span className="text-blue-300">
      {getRestaurantName(getLockedRestaurantId())}
    </span>
    <p className="text-blue-400/70 text-xs">
      You can only order from one restaurant at a time
    </p>
  </div>
)}
```

---

## 🎨 **VISUAL INDICATORS**

### **Cart Sidebar Banner:**
```
┌─────────────────────────────────────────────────────┐
│ Cart                                            [X] │
├─────────────────────────────────────────────────────┤
│ 🍔 Burger Restaurant                               │  ← NEW BANNER
│ You can only order from one restaurant at a time   │
├─────────────────────────────────────────────────────┤
│ • Cheeseburger           €9.90        [+] 1 [-]   │
│ • Bacon Burger           €11.50       [+] 1 [-]   │
├─────────────────────────────────────────────────────┤
│ Subtotal: €21.40                                   │
│ [Proceed to Checkout]                              │
└─────────────────────────────────────────────────────┘
```

### **Warning Modal:**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ Different Restaurant                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│ You currently have items from:                     │
│ 🍔 Burger Restaurant                               │
│                                                     │
│ To add items from:                                 │
│ 🥙 Döner Restaurant                                │
│                                                     │
│ You need to clear your current cart first.         │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 💡 Why? Each restaurant has its own payment │   │
│ │ account. You can only order from one        │   │
│ │ restaurant at a time.                        │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [Cancel]           [Clear Cart & Switch]           │
└─────────────────────────────────────────────────────┘
```

---

## 🧪 **TESTING SCENARIOS**

### **Test 1: Normal Order Flow (PASS)**
1. Go to menu
2. Select "Burger" restaurant
3. Add "Cheeseburger" to cart
4. Try to add another burger item
5. **Expected:** Item added successfully (same restaurant)

---

### **Test 2: Cross-Restaurant Block (PASS)**
1. Cart has "Cheeseburger" from Burger restaurant
2. Try to add "Döner Kebab" from Döner restaurant
3. **Expected:** Warning modal appears
4. Click "Cancel"
5. **Expected:** Modal closes, cart unchanged

---

### **Test 3: Clear and Switch (PASS)**
1. Cart has "Cheeseburger" from Burger restaurant
2. Try to add "Döner Kebab" from Döner restaurant
3. **Expected:** Warning modal appears
4. Click "Clear Cart & Switch"
5. **Expected:**
   - Cart clears (no burger items)
   - Locks to Döner restaurant
   - Döner Kebab added
   - Customization modal opens (if customizable)

---

### **Test 4: Empty Cart (PASS)**
1. Cart is empty (no locked restaurant)
2. Add item from any restaurant
3. **Expected:** Item added, cart locks to that restaurant

---

### **Test 5: Complete Order and Reorder (PASS)**
1. Complete order from Burger restaurant
2. Cart clears (unlocks)
3. Add item from Döner restaurant
4. **Expected:** Item added successfully (no warning)

---

## 🔗 **INTEGRATION WITH STRIPE**

### **Why This Matters:**

When you implement Stripe Connect:

```typescript
// ORDER PAYMENT FLOW
const order: Order = {
  id: 'ORD-123',
  restaurantId: 'burger', // ← Cart ensures this is ALWAYS single restaurant
  items: [
    { menuItem: { restaurantId: 'burger', ... }, ... }, // All items same restaurant
    { menuItem: { restaurantId: 'burger', ... }, ... }
  ],
  total: 25.50
};

// STRIPE PAYMENT
const payment = await stripe.createPayment({
  amount: order.total,
  stripeAccountId: getStripeAccountForRestaurant(order.restaurantId), // ← Easy routing!
  // Money goes directly to correct restaurant's Stripe account ✅
});
```

### **Without Cart Locking:**
```typescript
// ❌ PROBLEM: Mixed restaurant order
const order: Order = {
  items: [
    { menuItem: { restaurantId: 'burger', ... }, price: 10 },   // Burger restaurant
    { menuItem: { restaurantId: 'doner', ... }, price: 8 },     // Döner restaurant
    { menuItem: { restaurantId: 'doner-pizza', ... }, price: 12 } // Pizza restaurant
  ],
  total: 30
};

// ❌ Which Stripe account gets the money?
// ❌ How to split payment between 3 accounts?
// ❌ Refund nightmare if order cancelled
// ❌ Accounting chaos
```

---

## ✅ **SUCCESS CRITERIA**

- ✅ User can only add items from ONE restaurant at a time
- ✅ Warning modal appears when trying to add from different restaurant
- ✅ "Clear Cart & Switch" button works correctly
- ✅ Cart banner shows locked restaurant
- ✅ Cart unlocks when empty or order completed
- ✅ No TypeScript errors
- ✅ No runtime errors
- ✅ Professional UI/UX
- ✅ Clear messaging to users

---

## 🎯 **USER BENEFITS**

1. **Clear Experience:** Users understand they can only order from one restaurant
2. **No Confusion:** Cart clearly shows which restaurant they're ordering from
3. **Easy Switch:** One-click to clear cart and switch restaurants
4. **Payment Security:** Ensures correct payment routing (when Stripe is implemented)

---

## 🏢 **BUSINESS BENEFITS**

1. **Payment Routing:** Each order goes to correct Stripe account
2. **Accounting:** Clean, single-restaurant orders
3. **Refunds:** Easy to process (single restaurant, single payment)
4. **Restaurant Independence:** Each location operates independently
5. **No Payment Splitting:** Avoid complex multi-account transactions

---

## 📝 **FUTURE ENHANCEMENTS**

### **Phase 2: Stripe Connect Integration**
```typescript
// Stripe account mapping
const STRIPE_ACCOUNTS = {
  'doner': 'acct_doner_12345',
  'burger': 'acct_burger_67890',
  'doner-pizza': 'acct_pizza_11111'
};

// Automatic payment routing
const stripeAccountId = STRIPE_ACCOUNTS[order.restaurantId];
```

### **Phase 3: Multi-Order Support**
- Allow users to create separate orders for different restaurants
- "Order History" shows multiple simultaneous orders
- Each order processed independently

### **Phase 4: Restaurant-Specific Promotions**
- Promo codes locked to specific restaurant
- "10% off Burger Restaurant only"
- Prevents promo abuse across restaurants

---

## 🎉 **IMPLEMENTATION STATUS**

| Feature | Status | Notes |
|---------|--------|-------|
| Cart Locking | ✅ Complete | Locks to first item's restaurant |
| Warning Modal | ✅ Complete | Beautiful, clear messaging |
| Clear & Switch | ✅ Complete | One-click cart clearing |
| Cart Banner | ✅ Complete | Shows locked restaurant |
| TypeScript Types | ✅ Complete | Fully typed |
| Error Handling | ✅ Complete | No errors |
| UI/UX | ✅ Complete | Professional design |
| Documentation | ✅ Complete | This file! |

---

## 📞 **TESTING INSTRUCTIONS**

1. Open: http://localhost:5173/
2. Go to "Menu"
3. Select "Burger" restaurant
4. Add "Cheeseburger" to cart
5. ✅ Cart locks to Burger restaurant
6. Try to select "Döner" restaurant
7. Try to add "Döner Kebab"
8. ✅ Warning modal appears
9. Click "Clear Cart & Switch"
10. ✅ Döner Kebab added, cart now locked to Döner

---

**Implementation Complete!** 🎉  
**Ready for Production:** After Stripe Connect integration  
**Status:** ✅ **FULLY FUNCTIONAL**

