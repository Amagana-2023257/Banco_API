// src/middlewares/multer-uploads.js
import multer from 'multer';
import { cloudinary } from '../../configs/cloudinary.js';
import { Readable } from 'stream';
import fileType from 'file-type';
import sharp from 'sharp'; // Para verificar la integridad y calidad de la imagen
import fs from 'fs';

// Tipos de archivo permitidos y límite de tamaño (10MB)
const MIMETYPES = ['image/png', 'image/jpg', 'image/jpeg'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// Función para verificar si el archivo es una imagen válida
const isValidImage = async (buffer) => {
  const file = await fileType.fromBuffer(buffer);
  if (!file || !MIMETYPES.includes(file.mime)) {
    throw new Error('El archivo no es una imagen válida o es un formato no permitido.');
  }

  // Verificación con Sharp para asegurarse de que es una imagen válida
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    if (metadata.format !== file.ext) {
      throw new Error('El archivo no es una imagen válida según el contenido.');
    }
    if (metadata.width < 100 || metadata.height < 100) {
      throw new Error('La imagen es demasiado pequeña, debe ser al menos 100x100 píxeles.');
    }
  } catch (err) {
    throw new Error('El archivo está corrupto o no es una imagen válida.');
  }
};

// Función para crear la configuración de Multer
const createMulterConfig = () =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter: async (req, file, cb) => {
      try {
        // Verificación del tipo de archivo
        if (!MIMETYPES.includes(file.mimetype)) {
          return cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan: ${MIMETYPES.join(', ')}`), false);
        }

        // Verificación del tamaño del archivo
        if (file.size > MAX_SIZE) {
          return cb(new Error(`El archivo excede el tamaño permitido de ${MAX_SIZE / (1024 * 1024)} MB.`), false);
        }

        // Verificación de contenido real de la imagen
        await isValidImage(file.buffer);
        cb(null, true);
      } catch (err) {
        cb(err, false);
      }
    },
    limits: {
      fileSize: MAX_SIZE, // 10MB máximo
    },
  });


// Middlewares Multer: sube hasta 10 imágenes para el campo "images"
export const uploadProfilePictures = createMulterConfig().array('images', 10);

/**
 * Convierte un Buffer en un Readable Stream para Cloudinary
 */
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

/**
 * Sube un buffer de imagen a Cloudinary
 * @param {Buffer} buffer
 * @param {String} originalname
 * @param {String} folder
 * @returns {Promise<String>} URL segura de la imagen
 */
const uploadBuffer = (buffer, originalname, folder) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${folder}/${originalname.split('.').shift()}-${Date.now()}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Error subiendo a Cloudinary:', error);
          return reject(new Error('Error al subir imagen a Cloudinary'));
        }
        resolve(result.secure_url);
      }
    );

    // Convertimos buffer a stream y lo enviamos
    bufferToStream(buffer).pipe(uploadStream);
  });

/**
 * Sube una sola imagen (req.file) a Cloudinary
 * @param {Object} req – request de Express con req.file
 * @param {String} folder – carpeta en Cloudinary (default: 'profile-pictures')
 * @returns {Promise<String>} URL segura de la imagen
 */
export const uploadToCloudinary = async (req, folder = 'profile-pictures') => {
  if (!req.file) {
    throw new Error('No se ha subido ningún archivo');
  }
  return uploadBuffer(req.file.buffer, req.file.originalname, folder);
};

/**
 * Sube múltiples imágenes (req.files) a Cloudinary
 * @param {Object} req – request de Express con req.files[]
 * @param {String} folder – carpeta en Cloudinary (default: 'hotel-pictures')
 * @returns {Promise<String[]>} Array de URLs seguras
 */
export const uploadMultipleToCloudinary = async (
  req,
  folder = 'hotel-pictures'
) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new Error('No se han subido archivos');
  }

  // Subimos todas las imágenes en paralelo
  const uploadPromises = req.files.map((file) =>
    uploadBuffer(file.buffer, file.originalname, folder)
  );

  return Promise.all(uploadPromises);
};

/**
 * Verificación de archivo antes de cargar a Cloudinary
 * @param {Buffer} fileBuffer
 */
export const verifyImageBeforeUpload = async (fileBuffer) => {
  // Verificamos si la imagen tiene el tamaño adecuado y si es válida
  await isValidImage(fileBuffer);
};
