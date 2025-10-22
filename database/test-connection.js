import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27018/mrhappy';

console.log('🔄 Testing MongoDB connection...');
console.log('📡 Connection URI:', mongoURI);

async function testConnection() {
    try {
        console.log('\n⚡ Attempting to connect to MongoDB...');
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            connectTimeoutMS: 10000 // 10 second connection timeout
        });

        console.log('✅ MongoDB connection successful!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('🔌 Port:', mongoose.connection.port);
        console.log('📈 Ready State:', mongoose.connection.readyState);

        // Test database operations
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n📁 Available collections:');
        collections.forEach(collection => {
            console.log(`  - ${collection.name}`);
        });

        // Test if we can write to the database
        const testCollection = mongoose.connection.db.collection('connection_test');
        const testDoc = {
            message: 'Connection test successful',
            timestamp: new Date(),
            port: mongoose.connection.port
        };
        
        await testCollection.insertOne(testDoc);
        console.log('\n✨ Write test successful - document inserted');
        
        // Clean up test document
        await testCollection.deleteOne({ _id: testDoc._id });
        console.log('🧹 Test document cleaned up');

    } catch (error) {
        console.error('\n❌ MongoDB connection failed:');
        console.error('🔍 Error message:', error.message);
        console.error('🏷️ Error code:', error.code);
        console.error('📝 Error name:', error.name);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Suggestions:');
            console.error('  1. Make sure MongoDB is running on port 27018');
            console.error('  2. Start MongoDB with: mongod --port 27018 --dbpath C:\\data\\mrhappy');
            console.error('  3. Check if the data directory exists: C:\\data\\mrhappy');
        }
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Connection closed');
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
testConnection();
