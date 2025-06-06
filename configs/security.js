// configs/security.js
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import xss from 'xss-clean';

// ─────────────────────────────────────────────────────────────
// 1) Cabeceras de seguridad con Helmet
export const setSecurityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"], 
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://api.exchangerate-api.com", "https://banco-api-six.vercel.app"],
        // ajusta según las URLs que uses (Cloudinary, APIs externas, etc.)
      },
    },
    // Puedes incluir otras opciones de Helmet, como X-Frame-Options, HSTS, etc.
  });
};

// ─────────────────────────────────────────────────────────────
// 2) Rate limiter global
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 peticiones por IP en ese periodo
  message: {
    error: true,
    message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
  },
  standardHeaders: true,       // enviar X-RateLimit-* en las respuestas
  legacyHeaders: false,        // no enviar X-RateLimit-* obsoletos
  // keyGenerator: … si quieres usar alguna lógica personalizada
});
