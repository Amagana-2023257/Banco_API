// src/routes/user.routes.js
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  updateMe
} from './user.controller.js';

import {
  getUserByIdValidator,
  updateUserValidator,
  deleteValidator
} from '../middlewares/user-validators.js';

import { validateJWT } from '../middlewares/validate-jwt.js';
import { hasRoles } from '../middlewares/validate-roles.js';

const router = Router();

/**
 * GET /users
 * Obtiene todos los clientes y empleados activos (solo ADMIN_GLOBAL y GERENTE_SUCURSAL)
 */
router.get(
  '/all',
  validateJWT,
  hasRoles('ADMIN_GLOBAL', 'GERENTE_SUCURSAL'),
  getAllUsers
);

/**
 * GET /users/:id
 * Detalle de usuario por ID (CLIENTE o empleado) — accesible para ADMIN_GLOBAL, GERENTE_SUCURSAL, y el propio CLIENTE
 */
router.get(
  '/user/:id',
  validateJWT,
  // Permite ADMIN_GLOBAL y GERENTE_SUCURSAL, o al propio cliente (middleware interno)
  hasRoles('ADMIN_GLOBAL', 'GERENTE_SUCURSAL', 'CAJERO', 'CLIENTE'),
  getUserByIdValidator,
  getUserById
);

/**
 * PUT /users/:id
 * Actualiza datos de cliente/empleado — solo ADMIN_GLOBAL y GERENTE_SUCURSAL
 */
router.put(
  '/update/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL', 'GERENTE_SUCURSAL'),
  updateUserValidator,
  updateUser
);

/**
 * PUT /users/:id/deactivate
 * Desactiva usuario (soft delete) — solo ADMIN_GLOBAL
 */
router.put(
  '/delete/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL'),
  deactivateUser
);

router.put(
  '/me',
  validateJWT,
  updateMe
);

export default router;
