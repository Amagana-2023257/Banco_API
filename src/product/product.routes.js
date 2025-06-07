// src/routes/product.routes.js
import { Router } from 'express';
import { validateJWT } from '../middlewares/validate-jwt.js';
import { hasRole } from '../middlewares/validate-roles.js';
import * as pCtrl from '../controllers/product.controller.js';

const router = Router();
router.get('/', validateJWT, pCtrl.listProducts);
router.post('/', validateJWT, hasRole('ADMINB'), pCtrl.createProduct);
export default router;
