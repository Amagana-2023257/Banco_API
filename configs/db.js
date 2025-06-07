// configs/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const dbConnection = async () => {
  try {
    const uri = process.env.URI_MONGO;
    if (!uri) {
      throw new Error('La variable de entorno URI_MONGO no está definida.');
    }

    mongoose.connection.on('connecting', () => {
      console.log('MongoDB | try connecting');
    });
    mongoose.connection.on('connected', () => {
      console.log('MongoDB | connected to MongoDB Atlas');
    });
    mongoose.connection.on('open', () => {
      console.log('MongoDB | Connection open to Database');
    });
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB | disconnected from MongoDB');
    });
    mongoose.connection.on('error', (err) => {
      console.log('MongoDB | could not connect to MongoDB', err);
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
    });
  } catch (err) {
    console.log(`Database connection failed: ${err}`);
    // no process.exit, el servidor debe seguir vivo para responder CORS
  }
};
