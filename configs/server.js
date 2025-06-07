// configs/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { cloudinary } from './cloudinary.js';        
import { dbConnection } from './db.js';
import { rateLimiter, setSecurityHeaders } from './security.js';
import { swaggerDocs, swaggerUi } from './swagger.js';
import { handleErrors } from '../src/middlewares/handle-errors.js';

import AuthRoutes from '../src/auth/auth.routes.js';
import UserRoutes from '../src/user/user.routes.js';
import AccountRoutes from '../src/account/account.routes.js';
import TransactionRoutes from '../src/transaction/transaction.routes.js';
import createDefaultUsers from '../src/auth/auth.controller.js'; 


const app = express();

const middlewares = (app) => {
  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // CORSss
  app.use(
    cors({
      origin: [
        'https://banca-kinal.web.app',
        'http://localhost:5173'
      ],
      methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization'],
      credentials: true,
    })
  );
  app.options('*', cors());

  app.use(morgan('dev'));
  app.use(setSecurityHeaders());
  app.use(rateLimiter);
};

const routes = (app) => {
  app.get('/', (req, res) => res.json({ message: 'API Banca Kinal funcionando' }));
  app.use('/Banca-Kinal/v1/auth', AuthRoutes);
  app.use('/Banca-Kinal/v1/users', UserRoutes);
  app.use('/Banca-Kinal/v1/accounts', AccountRoutes);
  app.use('/Banca-Kinal/v1/transactions', TransactionRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

export const initServer = async () => {
  middlewares(app);
  await dbConnection();
  await createDefaultUsers();
  routes(app);
  app.use(handleErrors);

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};