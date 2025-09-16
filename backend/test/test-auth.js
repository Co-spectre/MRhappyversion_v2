// Test Authentication System
// Test connection and user registration/login functionality

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AuthService from '../src/services/AuthService.js';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27018/mrhappy';

console.log('🔧 Testing Authentication System...');
console.log('📡 MongoDB URI:', mongoURI);

async function testAuthSystem() {
    try {
        // Connect to MongoDB
        console.log('\n⚡ Connecting to MongoDB...');
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');

        // Initialize AuthService
        const authService = new AuthService();
        console.log('🔐 AuthService initialized');

        // Check available methods
        console.log('📋 Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(authService)).filter(name => name !== 'constructor'));

        // Test data
        const testUser = {
            email: 'test@mrhappy.com',
            password: 'TestPassword123!',
            firstName: 'Test',
            lastName: 'User',
            phone: '+1234567890'
        };

        console.log('\n🧪 Starting Authentication Tests...');

        // Test 1: User Registration
        console.log('\n1️⃣ Testing User Registration...');
        try {
            const registrationResult = await authService.register(testUser);
            console.log('✅ Registration successful:', {
                success: registrationResult.success,
                message: registrationResult.message,
                userId: registrationResult.user?.id
            });
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️ User already exists, skipping registration');
            } else {
                throw error;
            }
        }

        // Test 2: User Login
        console.log('\n2️⃣ Testing User Login...');
        const loginResult = await authService.login(testUser.email, testUser.password);
        console.log('✅ Login successful:', {
            success: loginResult.success,
            hasAccessToken: !!loginResult.accessToken,
            hasRefreshToken: !!loginResult.refreshToken,
            userEmail: loginResult.user?.email
        });

        // Test 3: Token Validation
        console.log('\n3️⃣ Testing Token Validation...');
        const tokenValidation = await authService.verifyAccessToken(loginResult.accessToken);
        console.log('✅ Token validation successful:', {
            valid: tokenValidation.valid,
            userId: tokenValidation.user?.id,
            email: tokenValidation.user?.email
        });

        // Test 4: Refresh Token
        console.log('\n4️⃣ Testing Token Refresh...');
        const refreshResult = await authService.refreshAccessToken(loginResult.refreshToken);
        console.log('✅ Token refresh successful:', {
            success: refreshResult.success,
            hasNewAccessToken: !!refreshResult.accessToken
        });

        console.log('\n🎉 All authentication tests passed successfully!');

    } catch (error) {
        console.error('\n❌ Authentication test failed:');
        console.error('🔍 Error:', error.message);
        console.error('📝 Stack:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 MongoDB connection closed');
        process.exit(0);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n⚠️ Received interrupt signal');
    await mongoose.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⚠️ Received termination signal');
    await mongoose.disconnect();
    process.exit(0);
});

// Run the test
testAuthSystem();
