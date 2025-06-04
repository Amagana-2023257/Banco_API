// src/middlewares/handleErrors.js
import winston from 'winston';  // Para logging de errores (puedes agregar tu propia implementación de logging)

// Crea un logger de Winston (o el sistema de logs que prefieras)
const logger = winston.createLogger({
  level: 'error',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'error.log' }),
  ],
});

/**
 * Middleware de manejo de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función de siguiente middleware
 */
export const handleErrors = (err, req, res, next) => {
  // Verificar si el error tiene un código de estado y si tiene un mensaje
  if (err.status === 400 || err.errors) {
    // Error de validación u otro tipo de error 400
    return res.status(400).json({
      success: false,
      message: err.message || 'Errores en la validación de los datos.',
      errors: err.errors || [],
    });
  }

  // Errores de autenticación o autorización (401, 403)
  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      message: err.message || 'No autorizado. Token no válido o expirado.',
    });
  }

  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      message: err.message || 'Acceso denegado. No tienes permiso para acceder a este recurso.',
    });
  }

  // Errores internos del servidor (500)
  if (err.status === 500) {
    // En producción no debemos exponer detalles del error
    if (process.env.NODE_ENV === 'production') {
      logger.error(err); // Registrar el error en el archivo de logs
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor. Intenta nuevamente más tarde.',
      });
    }

    // En desarrollo, proporcionar detalles del error
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack, // Solo en desarrollo para debug
    });
  }

  // Si el error no tiene un estado predefinido, respondemos con un error genérico 500
  logger.error(err);  // Registrar el error
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor. Intenta nuevamente más tarde.',
  });
};
