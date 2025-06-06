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
  // 1) Habilitar 'trust proxy' antes de registrar el rateLimiter
  app.set('trust proxy', 1);

  // 2) Parser de cookies y JSON
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // 3) CONFIGURAR CORS ANTES DE LAS RUTAS
  app.use(
    cors({
      origin: [
        'https://banca-kinal.web.app'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true, // si usas cookies o credenciales
    })
  );
  // 3b) Manejador global de preflight
  app.options('*', cors());

  // 4) Logger HTTP
  app.use(morgan('dev'));

  // 5) Cabeceras de seguridad (Helmet, etc.)
  app.use(setSecurityHeaders());

  // 6) Rate limiter DESPUÉS de habilitar trust proxy
  app.use(rateLimiter);
};

const routes = (app) => {
  // Ruta raíz para comprobar que el API está vivo
  app.get('/', (req, res) => {
    res.json({ message: 'API Banca Kinal funcionando' });
  });

  // Rutas de autenticación
  app.use('/Banca-Kinal/v1/auth', AuthRoutes);

  // Rutas de usuario
  app.use('/Banca-Kinal/v1/users', UserRoutes);

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
    // Se imprime el error en db.js; NO se detiene el servidor aquí
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
