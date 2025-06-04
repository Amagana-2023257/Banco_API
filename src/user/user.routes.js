import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  deleteUser
} from './user.controller.js';

import {
  getUserValidator,
  getUserByIdValidator,
  updateUserValidator,
  deleteValidator
} from '../middlewares/user-validators.js';

import { validateJWT } from '../middlewares/validate-jwt.js';
import { hasRoles } from '../middlewares/validate-roles.js';

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios activos (solo ADMIN_GLOBAL)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: No autorizado
 */
router.get(
  '/users',
  validateJWT,
  hasRoles('ADMIN_GLOBAL'),
  getAllUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtiene un usuario por ID (solo ADMIN_GLOBAL, ADMIN_HOTEL)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Puede ser ObjectId de Mongo o "Nombre Apellido"
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  '/users/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL', 'ADMIN_HOTEL'),
  getUserByIdValidator,
  getUserById
);

/**
 * @swagger
 * /users/update/{id}:
 *   put:
 *     summary: Actualiza datos de un usuario (solo ADMIN_GLOBAL)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ObjectId del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               monthlyIncome:
 *                 type: number
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Error de validación
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  '/users/update/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL'),
  updateUserValidator,
  updateUser
);

/**
 * @swagger
 * /users/deactivate/{id}:
 *   put:
 *     summary: Desactiva un usuario (solo ADMIN_GLOBAL)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ObjectId del usuario a desactivar
 *     responses:
 *       200:
 *         description: Usuario desactivado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  '/users/deactivate/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL'),
  deactivateUser
);

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     summary: Desactiva (soft delete) un usuario (solo ADMIN_GLOBAL)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ObjectId del usuario a desactivar
 *     responses:
 *       200:
 *         description: Usuario desactivado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete(
  '/users/delete/:id',
  validateJWT,
  hasRoles('ADMIN_GLOBAL'),
  deleteValidator,
  deleteUser
);

export default router;




