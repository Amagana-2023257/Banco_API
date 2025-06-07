// src/routes/account.routes.js
import { Router } from 'express';
import {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deactivateAccount
} from './account.controller.js';

import {
  createAccountValidator,
  getAccountByIdValidator,
  updateAccountValidator,
  deactivateAccountValidator
} from '../middlewares/account-validators.js';

import { validateJWT } from '../middlewares/validate-jwt.js';
import { hasRoles } from '../middlewares/validate-roles.js';

const router = Router();

/**
 * POST /accounts/create
 * Crea una nueva cuenta para un usuario
 * Roles permitidos: ADMIN_GLOBAL, GERENTE_SUCURSAL
 */
router.post(
  '/create',
  validateJWT,
  hasRoles('ADMIN_GLOBAL', 'GERENTE_SUCURSAL'),
  createAccountValidator,
  createAccount
);

/**
 * GET /accounts/all
 * Obtiene todas las cuentas
 * Roles permitidos: ADMIN_GLOBAL, GERENTE_SUCURSAL
 */
router.get(
  '/all',
  validateJWT,
  hasRoles('ADMIN_GLOBAL', 'GERENTE_SUCURSAL'),
  getAllAccounts
);

/**
 * GET /accounts/:id
 * Detalle de cuenta por ID — accesible para:
 *   - ADMIN_GLOBAL, GERENTE_SUCURSAL, CAJERO
 *   - o el propio CLIENTE (middleware interno)
 */
router.get(
  '/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL', 'GERENTE_SUCURSAL', 'CAJERO', 'CLIENTE'),
  getAccountByIdValidator,
  getAccountById
);

/**
 * PUT /accounts/update/:id
 * Actualiza datos de la cuenta (moneda, estado)
 * Roles permitidos: ADMIN_GLOBAL, GERENTE_SUCURSAL
 */
router.put(
  '/update/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL', 'GERENTE_SUCURSAL'),
  updateAccountValidator,
  updateAccount
);

/**
 * PUT /accounts/delete/:id
 * Desactiva la cuenta (soft delete)
 * Roles permitidos: ADMIN_GLOBAL
 */
router.put(
  '/delete/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL'),
  deactivateAccountValidator,
  deactivateAccount
);

export default router;
