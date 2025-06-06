// configs/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { rateLimiter, setSecurityHeaders } from './security.js';
import { swaggerDocs, swaggerUi } from './swagger.js';
import { handleErrors } from '../src/middlewares/handle-errors.js';
import cookieParser from 'cookie-parser';

import AuthRoutes from '../src/auth/auth.routes.js';
import UserRoutes from '../src/user/user.routes.js';

const app = express();

const middlewares = (app) => {
  // 1) Habilitar trust proxy ANTES de registrar el rate limiter.
  //    Si tu servidor está detrás de un solo proxy (Heroku, Cloud Run, etc.), usa '1'.
  //    Si tienes múltiples capas de proxy, puedes usar 'true'.
  app.set('trust proxy', 1);

  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // 2) Configurar CORS (ajusta el origin según tu deployment)
  app.use(
    cors({
      origin: 'https://banca-kinal.web.app', // Dominio de tu frontend en producción
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  app.use(morgan('dev'));
  app.use(setSecurityHeaders());

  // 3) Registrar el rateLimiter ahora que trust proxy está habilitado
  app.use(rateLimiter);
};

const routes = (app) => {
  // Opcional: ruta raíz para comprobar que el servidor API está vivo
  app.get('/', (req, res) => {
    res.json({ message: 'API Banca Kinal funcionando' });
  });

  // Rutas de autenticación y usuario
  app.use('/Banca-Kinal/v1/auth', AuthRoutes);
  app.use('/Banca-Kinal/v1/users', UserRoutes);

  // Documentación de Swagger
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
