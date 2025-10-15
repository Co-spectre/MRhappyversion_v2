# 🧪 Quick Test Guide - Multi-Restaurant Admin System

**Date:** October 15, 2025  
**Website:** http://localhost:5173/

---

## 🚀 **QUICK TEST INSTRUCTIONS**

### **Test 1: Döner Restaurant Admin** (2 minutes)

1. Open: http://localhost:5173/
2. Click **"Login"** button in header
3. Enter credentials:
   ```
   Email: doner@mrhappy.de
   Password: doner123
   ```
4. Click **"Login"**
5. You should see **"Admin Panel"** link in user menu
6. Click **"Admin Panel"**

**✅ Expected Result:**
- Blue banner at top: **"📍 Restaurant Admin: Mr. Happy Döner (Vegesack)"**
- Dashboard title: **"Mr. Happy Döner (Vegesack)"**
- Only shows orders with döner items
- Order counts are filtered by restaurant

---

### **Test 2: Burger Restaurant Admin** (2 minutes)

1. **Logout** from döner admin
2. Click **"Login"** again
3. Enter credentials:
   ```
   Email: burger@mrhappy.de
   Password: burger123
   ```
4. Click **"Login"**
5. Click **"Admin Panel"**

**✅ Expected Result:**
- Blue banner: **"📍 Restaurant Admin: Mr. Happy Burger (Vegesack)"**
- Dashboard title: **"Mr. Happy Burger (Vegesack)"**
- Only shows orders with burger items
- **Does NOT show döner orders** ✅

---

### **Test 3: Pizza Restaurant Admin** (2 minutes)

1. **Logout** from burger admin
2. Click **"Login"** again
3. Enter credentials:
   ```
   Email: pizza@mrhappy.de
   Password: pizza123
   ```
4. Click **"Login"**
5. Click **"Admin Panel"**

**✅ Expected Result:**
- Blue banner: **"📍 Restaurant Admin: Mr. Happy Döner & Pizza (Schwanewede)"**
- Dashboard title: **"Mr. Happy Döner & Pizza (Schwanewede)"**
- Only shows orders with pizza/döner items
- **Does NOT show burger orders** ✅

---

### **Test 4: Super Admin** (2 minutes)

1. **Logout** from pizza admin
2. Click **"Login"** again
3. Enter credentials:
   ```
   Email: admin@mrhappy.com
   Password: admin123
   ```
4. Click **"Login"**
5. Click **"Admin Panel"**

**✅ Expected Result:**
- **NO blue banner** (sees all restaurants)
- Dashboard title: **"Mr. Happy - Bestellverwaltung"**
- Shows **ALL orders from ALL 3 restaurants** ✅
- Total order counts across all restaurants

---

### **Test 5: Order Routing** (5 minutes)

1. **Logout** from admin
2. Click **"Login"** as customer:
   ```
   Email: customer@mrhappy.com
   Password: customer123
   ```
3. Go to **Menu**
4. Select **"Mr. Happy Burger"** restaurant
5. Add **"Cheeseburger"** to cart
6. Click **Checkout** and complete order
7. Note the order ID
8. **Logout** and login as **Burger Admin**:
   ```
   Email: burger@mrhappy.de
   Password: burger123
   ```
9. Open **Admin Panel**

**✅ Expected Result:**
- Your burger order appears in Burger admin panel ✅
- Order status: "Pending"
- Order has burger items

10. **Logout** and login as **Döner Admin**:
    ```
    Email: doner@mrhappy.de
    Password: doner123
    ```
11. Open **Admin Panel**

**✅ Expected Result:**
- Your burger order **DOES NOT appear** in Döner admin panel ✅
- Döner admin only sees döner orders

---

### **Test 6: Security Check** (2 minutes)

1. **Logout** completely
2. Try to navigate to admin panel without logging in
3. Try to access admin panel as regular customer

**✅ Expected Result:**
- Cannot access admin panel without admin credentials ✅
- No "Admin Panel" link visible for regular customers ✅
- Redirected to home page if trying to access directly ✅

---

## 📋 **ALL LOGIN CREDENTIALS**

### **Restaurant Admins:**
```
Döner:  doner@mrhappy.de   / doner123
Burger: burger@mrhappy.de  / burger123
Pizza:  pizza@mrhappy.de   / pizza123
```

### **Super Admin:**
```
Super Admin: admin@mrhappy.com / admin123
```

### **Test Customer:**
```
Customer: customer@mrhappy.com / customer123
```

---

## 🎯 **VISUAL INDICATORS**

### **Restaurant Admin (Döner):**
```
┌─────────────────────────────────────────────────────────────┐
│  📍 Restaurant Admin: Mr. Happy Döner (Vegesack)           │  ← Blue banner
├─────────────────────────────────────────────────────────────┤
│  ← Mr. Happy Döner (Vegesack)  🔊 Ton An  ⏰ 2  🔔 1  ✅ 0 │  ← Title
├─────────────────────────────────────────────────────────────┤
│  Bestellungen                                               │
│  ┌───────────────────────────────────────────────────┐     │
│  │ ORD-123 - Döner Kebab - €12.50 - Pending         │     │  ← Döner orders only
│  │ ORD-124 - Lahmacun - €8.90 - Preparing           │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### **Super Admin:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Mr. Happy - Bestellverwaltung  🔊 Ton An  ⏰ 5  🔔 3  ✅ 2 │  ← No banner
├─────────────────────────────────────────────────────────────┤
│  Bestellungen                                               │
│  ┌───────────────────────────────────────────────────┐     │
│  │ ORD-123 - Döner Kebab - €12.50 - Pending         │     │
│  │ ORD-124 - Cheeseburger - €9.90 - Preparing       │     │  ← All orders
│  │ ORD-125 - Pizza Margherita - €11.50 - Ready      │     │
│  └───────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ **SUCCESS CRITERIA**

- ✅ Each restaurant admin only sees their own orders
- ✅ Super admin sees all orders from all restaurants
- ✅ Orders automatically route to correct restaurant
- ✅ Restaurant banner shows for restaurant admins
- ✅ Dashboard title changes based on restaurant
- ✅ Order counts are restaurant-specific
- ✅ Security: Non-admins cannot access admin panel
- ✅ No breaking changes to existing functionality

---

## 🐛 **IF SOMETHING DOESN'T WORK**

### **Problem: "Admin Panel" link not showing**
**Solution:** Make sure you're logged in with admin credentials (doner@mrhappy.de, burger@mrhappy.de, pizza@mrhappy.de, or admin@mrhappy.com)

### **Problem: Seeing wrong restaurant's orders**
**Solution:** Logout and login again with correct admin credentials

### **Problem: Order not appearing in admin panel**
**Solution:** 
1. Check that order was placed from correct restaurant menu
2. Refresh admin panel (F5)
3. Check that you're logged in as correct restaurant admin

### **Problem: Cannot access admin panel**
**Solution:**
1. Make sure you're using correct login credentials
2. Check that dev server is running: http://localhost:5173/
3. Clear browser cache and reload

---

## 🎉 **TESTING COMPLETE**

Once you've verified all tests pass, the multi-restaurant admin system is **fully functional** and ready for production!

**Need Help?** Check the full documentation:
- `MULTI_RESTAURANT_ADMIN_IMPLEMENTATION.md` - Complete implementation details
- `MULTI_RESTAURANT_ADMIN_PLAN.md` - Original planning document

---

**Happy Testing!** 🍔🥙🍕
