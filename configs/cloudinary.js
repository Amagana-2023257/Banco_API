// cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

dotenv.config();

// 1) Aumentamos el límite global de listeners para evitar warnings
EventEmitter.defaultMaxListeners = 20;

// 2) Solo configuramos si no estaba ya configurado
if (!cloudinary.configured) {
  console.log('Iniciando conexión a Cloudinary...');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Conexión establecida a Cloudinary');
  // Marcamos un flag para que no vuelva a configurarse en este proceso
  cloudinary.configured = true;
}

export { cloudinary };
