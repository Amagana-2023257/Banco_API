// configs/security.js
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import csrf from 'csurf';
import { validationResult } from 'express-validator';

export const setSecurityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });
};

// Configuración de rate limiting para prevenir ataques DDoS
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP
  message: 'Demasiadas solicitudes, intenta nuevamente más tarde.',
});

// Middleware para limpiar los inputs (protección contra XSS)
export const xssProtection = xss();

// Configuración CSRF (protección contra ataques CSRF)
export const csrfProtection = csrf({ cookie: true });

// Validación de inputs
export const validateInputs = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
