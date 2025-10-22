# 🍃 MongoDB Setup Guide for MRhappy Platform

## MongoDB Connection Issues & Solutions

### Current Status
❌ **Connection Failed**: `connect ECONNREFUSED 127.0.0.1:27018`

This means MongoDB is not running on port 27018, or you need to adjust the connection.

## 🔧 Solution Options

### Option 1: Start MongoDB on Port 27018
```bash
# Start MongoDB with custom port
mongod --port 27018 --dbpath /data/db

# Or using MongoDB service
mongod --config /path/to/mongod.conf --port 27018
```

### Option 2: Use Default MongoDB Port (27017)
If your MongoDB is running on the default port 27017, update the connection string:

1. **Edit the `.env` file:**
```bash
# Change this line in backend/.env
MONGODB_URI=mongodb://localhost:27017/mrhappy_db
```

2. **Update MongoDB Compass connection:**
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`

### Option 3: Check Your Current MongoDB Setup

#### Find MongoDB Port
```bash
# Check if MongoDB is running
netstat -an | findstr :27017
netstat -an | findstr :27018

# Check MongoDB process
tasklist | findstr mongod
```

#### MongoDB Compass Connection
1. Open MongoDB Compass
2. Check the connection string at the top
3. Copy the exact connection string
4. Update our `.env` file with that string

## 🎯 Quick Fix Steps

### Step 1: Check MongoDB Status
```bash
# Check if MongoDB service is running
sc query MongoDB

# Or check with PowerShell
Get-Service MongoDB*
```

### Step 2: Start MongoDB Service
```bash
# Start MongoDB service
net start MongoDB

# Or with PowerShell
Start-Service MongoDB
```

### Step 3: Update Connection String
Based on what you find, update the connection in:
- `backend/.env`
- `backend/database/connection.js`

## 🔍 Debugging Commands

### Check MongoDB Installation
```bash
# Check MongoDB version
mongod --version

# Check MongoDB configuration
mongod --help
```

### Check Network Ports
```bash
# Check what's running on MongoDB ports
netstat -an | findstr :27017
netstat -an | findstr :27018
netstat -an | findstr :27019
```

### MongoDB Compass Debug
1. Open MongoDB Compass
2. Look at the connection string in the address bar
3. Test the connection
4. Copy the working connection string

## 💡 Common Solutions

### If MongoDB is on Port 27017:
Update `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/mrhappy_db
```

### If MongoDB Compass shows different connection:
Copy the exact connection string from Compass to `.env`

### If MongoDB is not installed:
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Use default port 27017

## 🧪 Test After Fix
```bash
cd backend
node database/test-connection.js
```

Should show:
```
✅ MongoDB Connected Successfully!
📊 Database: mrhappy_db
🏠 Host: localhost:27017
```
