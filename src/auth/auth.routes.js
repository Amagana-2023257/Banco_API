// src/routes/auth.routes.js
import { Router } from 'express';
import {
  register,
  login,
  requestPasswordReset,
  resetPassword
} from './auth.controller.js';
import {
  registerValidator,
  loginValidator,
  requestPasswordResetValidator,
  resetPasswordValidator
} from '../middlewares/user-validators.js';

const router = Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra un nuevo usuario con validaciones de seguridad
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 */
router.post(
  '/register',
  registerValidator,
  register
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 */
router.post(
  '/login',
  loginValidator,
  login
);

/**
 * @swagger
 * /request-password-reset:
 *   post:
 *     summary: Solicita código para restablecer contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo del usuario registrado.
 *     responses:
 *       200:
 *         description: Código enviado al email.
 */
router.post(
  '/request-password-reset',
  requestPasswordResetValidator,
  requestPasswordReset
);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Restablece la contraseña usando el código enviado
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente.
 */
router.post(
  '/reset-password',
  resetPasswordValidator,
  resetPassword
);

// Exportamos el router como la exportación predeterminada
export default router;
