// configs/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const dbConnection = async () => {
  try {
    const uri = process.env.URI_MONGO;
    console.log('>>>> DEBUG: URI_MONGO es:', uri);
    if (!uri) {
      throw new Error('La variable de entorno URI_MONGO no está definida.');
    }

    // Listeners opcionales para ver el estado de la conexión
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
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
    });
  } catch (err) {
    console.log(`Database connection failed: ${err}`);
    // NO HACER process.exit(1) para que el servidor siga corriendo y responda CORS
  }
};
