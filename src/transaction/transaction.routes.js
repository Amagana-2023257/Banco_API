// src/routes/transaction.routes.js
import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
  deposit,
  transfer,
  purchase,
  credit,
  updateTransaction,
  deleteTransaction
} from './transaction.controller.js';

import {
  getTransactionByIdValidator,
  depositValidator,
  transferValidator,
  purchaseValidator,
  creditValidator,
  updateTransactionValidator,
  deleteTransactionValidator
} from '../middlewares/transaction-validators.js';

import { validateJWT } from '../middlewares/validate-jwt.js';
import { hasRoles } from '../middlewares/validate-roles.js';

const router = Router();

/**
 * GET /transactions/all
 * Obtiene todas las transacciones
 * Roles permitidos: ADMIN_GLOBAL, GERENTE_SUCURSAL, CAJERO
 */
router.get(
  '/all',
  validateJWT,
  hasRoles('ADMIN_GLOBAL', 'GERENTE_SUCURSAL', 'CAJERO'),
  getAllTransactions
);

/**
 * GET /transactions/:id
 * Detalle de transacción por ID
 * Roles permitidos: ADMIN_GLOBAL, GERENTE_SUCURSAL, CAJERO
 */
router.get(
  '/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL', 'GERENTE_SUCURSAL', 'CAJERO'),
  getTransactionByIdValidator,
  getTransactionById
);

/**
 * POST /transactions/deposit
 * Realiza un depósito
 * Roles permitidos: CAJERO, CLIENTE
 */
router.post(
  '/deposit',
  validateJWT,
  hasRoles('ADMIN_GLOBAL','CAJERO', 'CLIENTE'),
  depositValidator,
  deposit
);

/**
 * POST /transactions/transfer
 * Realiza una transferencia entre cuentas
 * Roles permitidos: CLIENTE
 */
router.post(
  '/transfer',
  validateJWT,
  hasRoles('ADMIN_GLOBAL','CLIENTE'),
  transferValidator,
  transfer
);

/**
 * POST /transactions/purchase
 * Registra una compra (descuenta saldo)
 * Roles permitidos: CLIENTE
 */
router.post(
  '/purchase',
  validateJWT,
  hasRoles('ADMIN_GLOBAL','CLIENTE'),
  purchaseValidator,
  purchase
);

/**
 * POST /transactions/credit
 * Aplica un crédito (abono)
 * Roles permitidos: CAJERO
 */
router.post(
  '/credit',
  validateJWT,
  hasRoles('ADMIN_GLOBAL','CAJERO'),
  creditValidator,
  credit
);

/**
 * PUT /transactions/update/:id
 * Actualiza datos de la transacción
 * Roles permitidos: ADMIN_GLOBAL, GERENTE_SUCURSAL
 */
router.put(
  '/update/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL','ADMIN_GLOBAL', 'GERENTE_SUCURSAL'),
  updateTransactionValidator,
  updateTransaction
);

/**
 * DELETE /transactions/delete/:id
 * Elimina una transacción (borrado físico)
 * Roles permitidos: ADMIN_GLOBAL
 */
router.delete(
  '/delete/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL','ADMIN_GLOBAL'),
  deleteTransactionValidator,
  deleteTransaction
);

export default router;
