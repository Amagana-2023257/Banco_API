import winston from 'winston';  // Para logging de errores (puedes agregar tu propia implementación de logging)

// Crea un logger de Winston
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
  // Registrar los detalles de la solicitud antes de enviar la respuesta
  logger.error(`Error en ${req.method} ${req.originalUrl} con body: ${JSON.stringify(req.body)}`);
  
  // Si el error tiene un estado y es 400 (bad request) o contiene errores
  if (err.status === 400 || err.errors) {
    logger.error('Errores de validación:', err.errors || err.message);
    return res.status(400).json({
      success: false,
      message: err.message || 'Errores en la validación de los datos.',
      errors: err.errors || [],
    });
  }

  // Errores de autenticación o autorización (401, 403)
  if (err.status === 401) {
    logger.error('Acceso no autorizado:', err.message);
    return res.status(401).json({
      success: false,
      message: err.message || 'No autorizado. Token no válido o expirado.',
    });
  }

  if (err.status === 403) {
    logger.error('Acceso denegado:', err.message);
    return res.status(403).json({
      success: false,
      message: err.message || 'Acceso denegado. No tienes permiso para acceder a este recurso.',
    });
  }

  // Errores internos del servidor (500)
  if (err.status === 500) {
    logger.error('Error interno del servidor:', err);
    // En producción no debemos exponer detalles del error
    if (process.env.NODE_ENV === 'production') {
      // Registrar el error completo en el archivo de logs
      logger.error(err);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor. Intenta nuevamente más tarde.',
      });
    }

    // En desarrollo, proporcionar detalles del error para depuración
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack, // Solo en desarrollo para debug
    });
  }

  // Si el error no tiene un estado predefinido, respondemos con un error genérico 500
  logger.error('Error desconocido:', err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor. Intenta nuevamente más tarde.',
  });
};
