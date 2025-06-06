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
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  app.use(morgan('dev'));
  app.use(setSecurityHeaders());
  app.use(rateLimiter);
};

const routes = (app) => {
  app.use('/Banca-Kinal/v1/auth', AuthRoutes);
  app.use('/Banca-Kinal/v1/users', UserRoutes);
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
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log(`Server initialization failed: ${err}`);
  }
};
