// configs/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const dbConnection = async () => {
  try {
    // Listeners (opcional, para debug)
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

    // Leer la URI desde la variable de entorno
    const uri = process.env.URI_MONGO;
    if (!uri) {
      throw new Error('La variable de entorno URI_MONGO no está definida.');
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50,
      // tls: true  // no es necesario si tu URI usa "mongodb+srv://"
    });
    // Si llega hasta aquí, la conexión fue exitosa.
  } catch (err) {
    console.log(`Database connection failed: ${err}`);
    throw err;
  }
};
