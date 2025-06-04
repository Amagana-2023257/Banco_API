// index.js
import { config } from 'dotenv';
import { initServer } from './configs/server.js';

// Cargar las variables de entorno
config();

const startServer = async () => {
  try {
    await initServer();
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

startServer();
