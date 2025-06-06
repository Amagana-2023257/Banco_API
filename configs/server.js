import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { rateLimiter, setSecurityHeaders } from './security.js';
import { cloudinary } from './cloudinary.js';
import { swaggerDocs, swaggerUi } from './swagger.js';
import { handleErrors } from '../src/middlewares/handle-errors.js';
import cookieParser from 'cookie-parser';

import AuthRoutes from '../src/auth/auth.routes.js';
import UserRoutes from '../src/user/user.routes.js';

const app = express();

const middlewares = (app) => {
  // 1) Habilitamos trust proxy ANTES de cualquier uso de express-rate-limit
  //    Si tienes un solo proxy (por ejemplo Heroku, Cloud Run, AWS ELB, etc.), basta con “1”.
  //    Si hay más capas, podrías usar `app.set('trust proxy', true)` para confiar en cualquier X-Forwarded-For.
  app.set('trust proxy', 1);

  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(cors({
    origin: 'https://banca-kinal.web.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  app.use(morgan('dev'));
  app.use(setSecurityHeaders());

  // 2) Ahora sí aplicamos el rate limiter, ya con trust proxy habilitado
  app.use(rateLimiter);
};

const routes = (app) => {
  app.use('/Banca-Kinal/v1/auth', AuthRoutes);
  app.use('/Banca-Kinal/v1/users', UserRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

// Si quieres evitar el “GET / 404” puedes definir una ruta raíz (opcional)
// app.get('/', (req, res) => res.send('Servidor API está vivo'));

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
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log(`Server initialization failed: ${err}`);
  }
};
