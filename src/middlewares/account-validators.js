// src/middlewares/account-validators.js
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

export const createAccountValidator = [
  check('userId', 'El campo userId es obligatorio').notEmpty(),
  check('userId', 'userId inválido').isMongoId(),
  check('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('La moneda debe tener 3 caracteres')
    .isAlpha().withMessage('La moneda solo puede contener letras'),
  validate
];

export const getAccountByIdValidator = [
  check('id', 'ID de cuenta inválido').isMongoId(),
  validate
];

export const updateAccountValidator = [
  check('id', 'ID de cuenta inválido').isMongoId(),
  check('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('La moneda debe tener 3 caracteres')
    .isAlpha().withMessage('La moneda solo puede contener letras'),
  check('status')
    .optional()
    .isBoolean().withMessage('El estado debe ser true o false'),
  validate
];

export const deactivateAccountValidator = [
  check('id', 'ID de cuenta inválido').isMongoId(),
  validate
];
