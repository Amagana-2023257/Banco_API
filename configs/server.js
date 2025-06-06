// configs/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { dbConnection } from './db.js';
import { rateLimiter, setSecurityHeaders } from './security.js';
import { swaggerDocs, swaggerUi } from './swagger.js';
import { handleErrors } from '../src/middlewares/handle-errors.js';

import AuthRoutes from '../src/auth/auth.routes.js';
import UserRoutes from '../src/user/user.routes.js';

const app = express();

const middlewares = (app) => {
  // ───────────────────────────────────────────────────────────
  // 1) Habilitamos 'trust proxy' antes de registrar el rateLimiter.
  //    Si tu servidor está detrás de un único proxy (p. ej. Vercel, Heroku),
  //    usa "1". Si hay varias capas de proxy, puedes usar "true".
  app.set('trust proxy', 1);

  // ───────────────────────────────────────────────────────────
  // 2) Parser de cookies, body, etc.
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // ───────────────────────────────────────────────────────────
  // 3) CORS: permitir origen de producción (y opcionalmente localhost para desarrollo)
  app.use(
    cors({
      origin: [
        'https://banca-kinal.web.app', // dominio de tu front en producción
        'http://localhost:5173'          // para pruebas locales (si usas Vite en el front)
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true, // si necesitas enviar/recibir cookies de sesión
    })
  );

  // ───────────────────────────────────────────────────────────
  // 4) Registrar un manejador genérico de OPTIONS (preflight CORS)
  app.options('*', cors());

  // ───────────────────────────────────────────────────────────
  // 5) Logger HTTP (morgan)
  app.use(morgan('dev'));

  // ───────────────────────────────────────────────────────────
  // 6) Cabeceras de seguridad (helmet u otras)
  app.use(setSecurityHeaders());

  // ───────────────────────────────────────────────────────────
  // 7) Rate limiter (express-rate-limit) — ahora que trust proxy está habilitado
  app.use(rateLimiter);
};

const routes = (app) => {
  // ───────────────────────────────────────────────────────────
  // Ruta raíz para comprobar que el API está vivo
  app.get('/', (req, res) => {
    res.json({ message: 'API Banca Kinal funcionando' });
  });

  // ───────────────────────────────────────────────────────────
  // Rutas de autenticación (/auth/...)
  app.use('/Banca-Kinal/v1/auth', AuthRoutes);

  // ───────────────────────────────────────────────────────────
  // Rutas de usuarios (/users/...)
  app.use('/Banca-Kinal/v1/users', UserRoutes);

  // ───────────────────────────────────────────────────────────
  // Documentación Swagger (opcional)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

const handleError = (app) => {
  app.use(handleErrors);
};

const conectarDB = async () => {
  try {
    await dbConnection();
  } catch (err) {
    console.log(`Database connection failed: ${err}`);
    process.exit(1);
  }
};

export const initServer = () => {
  try {
    middlewares(app);
    conectarDB();
    routes(app);
    handleError(app);

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log(`Server initialization failed: ${err}`);
  }
};
