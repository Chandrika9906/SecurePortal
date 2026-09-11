const mongoose = require('mongoose');

let isInMemoryFallback = false;

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/secure_content_portal';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Using resilient in-memory storage fallback.`);
    isInMemoryFallback = true;
    return null;
  }
};

const getIsInMemoryFallback = () => isInMemoryFallback;

module.exports = { connectDB, getIsInMemoryFallback };
