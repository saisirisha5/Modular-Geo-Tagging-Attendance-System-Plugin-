//Standalone script to test if mongodb connection is working or not
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('DB_URI:', process.env.DB_URI || 'Not set');
    
    await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/geo-location');
    console.log('✅ MongoDB connected successfully!');
    
    // Test if we can access the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n💡 Solutions:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check your .env file has DB_URI');
    console.log('3. If using MongoDB Atlas, use the correct connection string');
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testConnection(); 