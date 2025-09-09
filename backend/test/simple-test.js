// Simple Authentication Test
import mongoose from 'mongoose';
import { User } from '../database/mongodb-schema.js';

console.log('🔧 Simple Auth Test Starting...');

// Connect to MongoDB
const mongoURI = 'mongodb://localhost:27018/mrhappy';

async function simpleTest() {
    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Create a simple user with all required fields
        const userData = {
            email: 'simple@test.com',
            password: 'hashedpassword123',
            name: 'Simple Test User', // Required field
            phone: '+1234567890',
            isEmailVerified: true,
            dataProcessingConsent: true // Required field
        };

        // Try to create user
        const user = new User(userData);
        await user.save();
        console.log('✅ User created:', user.email);

        // Find the user
        const foundUser = await User.findOne({ email: userData.email });
        console.log('✅ User found:', foundUser.email);

        console.log('🎉 Simple test completed successfully!');

    } catch (error) {
        if (error.code === 11000) {
            console.log('ℹ️ User already exists');
        } else {
            console.error('❌ Test failed:', error.message);
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
        process.exit(0);
    }
}

simpleTest();
