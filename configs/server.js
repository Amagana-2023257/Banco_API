// configs/server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { rateLimiter, setSecurityHeaders, xssProtection, csrfProtection } from './security.js';
import { cloudinary } from './cloudinary.js';
import { swaggerDocs, swaggerUi } from './swagger.js';
import { handleErrors } from '../src/middlewares/handle-errors.js';

// Importamos el router de auth correctamente
import AuthRoutes from '../src/auth/auth.routes.js';
import UserRoutes from '../src/user/user.routes.js';

const middlewares = (app) => {
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }));

  // Seguridad avanzada
  app.use(setSecurityHeaders());  // Cabeceras HTTP seguras
  app.use(xssProtection);         // Protección XSS
  app.use(csrfProtection);        // Protección CSRF

  app.use(rateLimiter);           // Límite de tasa de peticiones
};

const routes = (app) => {
  app.use('/hotelManager/v1/auth', AuthRoutes);  // Ahora se importa correctamente
  app.use('/hotelManager/v1/users', UserRoutes);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

const handleError = (app) => {
  app.use(handleErrors);  // Middleware para manejar los errores de manera centralizada
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
  const app = express();
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
