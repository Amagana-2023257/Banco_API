// src/middlewares/validate-fields.js
import { validationResult } from 'express-validator';

/**
 * Middleware para validar los campos de la solicitud según las reglas de express-validator.
 * Devuelve un error detallado si hay campos no válidos.
 */
export const validarCampos = (req, res, next) => {
  const errors = validationResult(req);

  // Si no hay errores, continúa con el siguiente middleware o ruta
  if (errors.isEmpty()) {
    return next();
  }

  // Si hay errores, extraerlos y formatearlos
  const extractedErrors = errors.array().map(err => ({
    field: err.param, // Nombre del campo
    message: err.msg, // Mensaje de error asociado
    value: err.value, // Valor recibido para el campo
  }));

  // En entorno de desarrollo, incluimos más detalles
  if (process.env.NODE_ENV === 'development') {
    console.error('Validation errors: ', extractedErrors);
  }

  // Enviar respuesta con los errores de validación
  return res.status(400).json({
    success: false,
    message: 'Campos no válidos en la solicitud',
    errors: extractedErrors,
  });
};
