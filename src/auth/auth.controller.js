// src/controllers/auth.controller.js
import { hash, verify } from 'argon2';
import crypto from 'crypto';
import path from 'path';
import User from '../user/user.model.js';
import { generateJWT } from '../helpers/generate-jwt.js';
import { sendEmail } from '../helpers/email-helper.js';  // Helper para enviar correos electrónicos
import { emailExists, usernameExists } from '../helpers/db-validators.js'; // Verifica si el email o nombre de usuario ya existen

/**
 * Registrar un nuevo usuario con validaciones de seguridad.
 */
export const register = async (req, res) => {
  const { name, surname, username, email, password, phone, role, monthlyIncome } = req.body;

  try {
    // Verificar si el email o el username ya están registrados
    await emailExists(email);
    await usernameExists(username);

    // Verificar ingresos mensuales (mayores a Q100)
    if (monthlyIncome < 100) {
      return res.status(400).json({
        success: false,
        message: 'El ingreso mensual debe ser mayor a Q100'
      });
    }

    // Hash de la contraseña usando Argon2
    const hashedPassword = await hash(password);

    // Crear un nuevo usuario
    const user = await User.create({
      name: name.trim(),
      surname: surname.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim(),
      role: role || 'USER_ROLE',  // Asignar un rol por defecto si no se proporciona
      monthlyIncome,
    });

    // Generar JWT
    const userDetails = user.toJSON();
    const token = await generateJWT(userDetails.id);

    // Enviar correo de bienvenida (opcional)
    await sendEmail({
      to: user.email,
      subject: 'Bienvenido a nuestro servicio',
      text: `Hola ${user.name},\n\nTu cuenta ha sido creada exitosamente.\n\nAtentamente, el equipo.`,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userDetails: { token, user: userDetails },
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Error de validación', errors: messages });
    }
    if (err.code === 11000) { // Error de duplicación de datos (email o username)
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({ success: false, message: `El ${field} ya existe.` });
    }
    return res.status(500).json({ success: false, message: 'Fallo en el registro', error: err.message });
  }
};

/**
 * Login de usuario
 */
export const login = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (!user || !user.status) {
      return res.status(400).json({ success: false, message: 'Credenciales inválidas o cuenta desactivada' });
    }

    // Verificar la contraseña usando Argon2
    const valid = await verify(user.password, password);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    // Generar JWT
    const userDetails = user.toJSON();
    const token = await generateJWT(userDetails.id);

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      userDetails: { token, user: userDetails },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Error en el servidor al iniciar sesión', error: err.message });
  }
};

/**
 * Solicitar recuperación de contraseña
 */
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email no registrado' });
    }

    // Generar código y expiración
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expires = Date.now() + 3600 * 1000;

    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(expires);
    await user.save();

    // Enviar correo con el código
    await sendEmail({
      to: user.email,
      subject: 'Código para restablecer contraseña',
      text: `Tu código de recuperación es: ${resetCode}`,
    });

    return res.status(200).json({ success: true, message: 'Código enviado al email' });
  } catch (err) {
    console.error('Request reset error:', err);
    return res.status(500).json({ success: false, message: 'Error solicitando restablecimiento de contraseña', error: err.message });
  }
};

/**
 * Restablecer contraseña utilizando código
 */
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      passwordResetCode: code,
      passwordResetExpires: { $gt: new Date() }, // Verificar que el código no haya expirado
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Código inválido o expirado' });
    }

    // Hash de la nueva contraseña
    user.password = await hash(newPassword);
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Contraseña restablecida correctamente' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ success: false, message: 'Error restableciendo la contraseña', error: err.message });
  }
};

/**
 * Crear un usuario por defecto para cada rol (ejecutar una sola vez)
 */
export const createDefaultUsers = async () => {
  const roles = [
    { key: 'ADMIN_GLOBAL', name: 'Super Admin Global', email: 'admin_global@correo.com' },
  ];

  for (const { key, name, email } of roles) {
    try {
      const exists = await User.exists({ role: key });
      if (exists) continue;
      
      const password = 'Chinito2,000';
      const hashedPassword = await hash(password);
      const defaultUser = new User({
        name,
        surname: 'Default',
        username: key.toLowerCase(),
        email,
        password: hashedPassword,
        phone: '',
        role: key,
        status: true,
      });

      await defaultUser.save();
      console.log(`Usuario por defecto creado: ${key}`);
    } catch (err) {
      console.error(`Error creando user default ${key}:`, err);
    }
  }
};

export default createDefaultUsers;
