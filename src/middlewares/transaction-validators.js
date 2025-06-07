// src/middlewares/transaction-validators.js
import { check, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

export const getTransactionByIdValidator = [
  check('id', 'ID de transacción inválido').isMongoId(),
  validate
];

export const depositValidator = [
  check('accountId', 'El campo accountId es obligatorio').notEmpty(),
  check('accountId', 'accountId inválido').isMongoId(),
  check('amount', 'El monto es obligatorio').notEmpty(),
  check('amount', 'El monto debe ser un número positivo').isFloat({ gt: 0 }),
  validate
];

export const transferValidator = [
  check('fromAccountId', 'El campo fromAccountId es obligatorio').notEmpty(),
  check('fromAccountId', 'fromAccountId inválido').isMongoId(),
  check('toAccountId', 'El campo toAccountId es obligatorio').notEmpty(),
  check('toAccountId', 'toAccountId inválido').isMongoId(),
  check('amount', 'El monto es obligatorio').notEmpty(),
  check('amount', 'El monto debe ser un número positivo').isFloat({ gt: 0 }),
  validate
];

export const purchaseValidator = [
  check('accountId', 'El campo accountId es obligatorio').notEmpty(),
  check('accountId', 'accountId inválido').isMongoId(),
  check('amount', 'El monto es obligatorio').notEmpty(),
  check('amount', 'El monto debe ser un número positivo').isFloat({ gt: 0 }),
  validate
];

export const creditValidator = [
  check('accountId', 'El campo accountId es obligatorio').notEmpty(),
  check('accountId', 'accountId inválido').isMongoId(),
  check('amount', 'El monto es obligatorio').notEmpty(),
  check('amount', 'El monto debe ser un número positivo').isFloat({ gt: 0 }),
  validate
];

export const updateTransactionValidator = [
  check('id', 'ID de transacción inválido').isMongoId(),
  check('type')
    .optional()
    .isIn(['DEPOSITO', 'TRANSFERENCIA', 'COMPRA', 'CREDITO'])
    .withMessage('Tipo de transacción no válido'),
  check('amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('El monto debe ser un número positivo'),
  check('relatedAccount')
    .optional()
    .isMongoId().withMessage('relatedAccount inválido'),
  check('reversed')
    .optional()
    .isBoolean().withMessage('El campo reversed debe ser true o false'),
  validate
];

export const deleteTransactionValidator = [
  check('id', 'ID de transacción inválido').isMongoId(),
  validate
];
