import { body, param } from 'express-validator';
import { validarCampos } from './validate-fields.js';
import { emailExists, usernameExists, userExists } from '../helpers/db-validators.js';
import validator from 'validator'; // Importar validator como paquete por defecto

// Definir requireEmailOrUsername para comprobar que al menos uno de los campos está presente
export const requireEmailOrUsername = () => {
  return body().custom(value => {
    if (!value.email && !value.username) {
      throw new Error('Debe proporcionar al menos un email o un nombre de usuario');
    }
    return true;
  });
};

// Validación para obtener todos los usuarios (sin params)
export const getUserValidator = [validarCampos];

// Validación para obtener un usuario por ID
export const getUserByIdValidator = [
  param('id').custom(async (value) => {
    await userExists(value);  // Verifica que el usuario con el ID proporcionado exista
  }).withMessage('Usuario no encontrado'),
  validarCampos
];

// Validación para actualizar usuario
export const updateUserValidator = [
  param('id').isMongoId().withMessage('ID de usuario inválido'),
  
  // Validación de nombre
  body('name')
    .optional()
    .isString().withMessage('El nombre debe ser texto')
    .isLength({ max: 50 }).withMessage('El nombre no debe superar 50 caracteres'),
  
  // Validación de apellido
  body('surname')
    .optional()
    .isString().withMessage('El apellido debe ser texto')
    .isLength({ max: 50 }).withMessage('El apellido no debe superar 50 caracteres'),
  
  // Validación de email
  body('email')
    .optional()
    .isEmail().withMessage('Formato de email inválido')
    .custom(async (email) => {
      await emailExists(email);  // Verifica que el email no esté ya registrado
    }),

  // Validación de teléfono
  body('phone')
    .optional()
    .isMobilePhone('any').withMessage('Teléfono inválido'),
  
  // Validación de rol
  body('role')
    .optional()
    .isIn(['ADMIN_GLOBAL', 'ADMIN_HOTEL', 'USER_ROLE', 'ADMIN_SERVICE'])
    .withMessage('Rol no válido'),
  
  // Validación de ingresos mensuales
  body('monthlyIncome')
    .optional()
    .isFloat({ min: 100 }).withMessage('Los ingresos mensuales deben ser mayores a Q100'),

  validarCampos
];

// Validación para eliminar usuario (soft delete)
export const deleteValidator = [
  param('uid').custom(async (value) => {
    await userExists(value);  // Verifica que el usuario con el ID proporcionado exista
  }).withMessage('Usuario no encontrado'),
  validarCampos
];

// Validación para registrar usuario
export const registerValidator = [
  // Validación de nombre
  body('name')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 50 }).withMessage('El nombre no debe superar 50 caracteres'),
  
  // Validación de apellido
  body('surname')
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ max: 50 }).withMessage('El apellido no debe superar 50 caracteres'),
  
  // Validación de email
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Formato de email inválido')
    .custom(async (email) => {
      await emailExists(email);  // Verifica que el email no esté ya registrado
    }),

  // Validación de nombre de usuario
  body('username')
    .notEmpty().withMessage('El usuario es requerido')
    .custom(async (username) => {
      await usernameExists(username);  // Verifica que el nombre de usuario no esté ya registrado
    }),

  // Validación de contraseña
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .custom(value => {
      if (!validator.isStrongPassword(value, { minLength: 8, minLowercase: 1, minNumbers: 1 })) {
        throw new Error('La contraseña debe ser fuerte, incluyendo al menos una letra minúscula, un número y 8 caracteres.');
      }
      return true;
    }),
  
  // Validación de teléfono (opcional)
  body('phone')
    .optional()
    .isMobilePhone('any').withMessage('Teléfono inválido'),
  
  // Validación de rol (opcional)
  body('role')
    .optional()
    .isIn(['ADMIN_GLOBAL', 'ADMIN_HOTEL', 'USER_ROLE', 'ADMIN_SERVICE'])
    .withMessage('Rol no válido'),
  
  // Validación de ingresos mensuales
  body('monthlyIncome')
    .notEmpty().withMessage('Los ingresos mensuales son requeridos')
    .isFloat({ min: 100 }).withMessage('Los ingresos mensuales deben ser mayores a Q100'),
  
  // Validación de si se envía email o username
  requireEmailOrUsername().withMessage('Debe enviar email o username'),
  
  validarCampos
];

// Validación para login
export const loginValidator = [
  body('email')
    .optional()
    .isEmail().withMessage('Formato de email inválido'),
  
  body('username')
    .optional()
    .isString().withMessage('El usuario debe ser texto'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  
  // Validación de si se envía email o username
  requireEmailOrUsername().withMessage('Debe enviar email o username'),
  
  validarCampos
];

// Validación para solicitar reset password
export const requestPasswordResetValidator = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Formato de email inválido'),
  
  validarCampos
];

// Validación para reset password
export const resetPasswordValidator = [
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Formato de email inválido'),
  
  body('code')
    .notEmpty().withMessage('El código es requerido')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
  
  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
  
  validarCampos
];
