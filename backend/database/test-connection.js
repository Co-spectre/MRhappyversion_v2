// MongoDB Test for MRhappy Platform
// Test script to verify connection to mongodb://localhost:27018/mrhappy_db

const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🧪 Testing MongoDB Connection...');
    console.log('📍 Connection String:', process.env.MONGODB_URI || 'mongodb://localhost:27018/mrhappy_db');

    // Connection options (updated for modern MongoDB driver)
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Attempt connection
    const connection = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27018/mrhappy_db',
      options
    );

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Database: ${connection.connection.name}`);
    console.log(`🏠 Host: ${connection.connection.host}:${connection.connection.port}`);
    console.log(`🔧 ReadyState: ${connection.connection.readyState} (1 = connected)`);

    // Test basic operations
    await testBasicOperations();

    // Disconnect
    await mongoose.disconnect();
    console.log('👋 Disconnected successfully');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Make sure MongoDB is running on port 27018');
      console.log('   2. Check MongoDB Compass connection');
      console.log('   3. Verify the port number in your connection string');
      console.log('   4. Try: mongod --port 27018');
    }
    
    process.exit(1);
  }
}

async function testBasicOperations() {
  try {
    console.log('\n🔬 Testing basic database operations...');

    // Create a simple test schema
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('ConnectionTest', testSchema);

    // Test create
    const testDoc = new TestModel({ name: 'Connection Test' });
    await testDoc.save();
    console.log('✅ Create operation successful');

    // Test read
    const found = await TestModel.findOne({ name: 'Connection Test' });
    console.log('✅ Read operation successful:', found.name);

    // Test update
    found.name = 'Updated Test';
    await found.save();
    console.log('✅ Update operation successful');

    // Test delete
    await TestModel.deleteOne({ _id: found._id });
    console.log('✅ Delete operation successful');

    // Clean up test collection
    await TestModel.collection.drop();
    console.log('✅ Test collection cleaned up');

  } catch (error) {
    console.error('❌ Basic operations failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
