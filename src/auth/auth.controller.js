// src/controllers/auth.controller.js
import { hash, verify } from 'argon2';
import crypto from 'crypto';
import User from '../user/user.model.js';
import { generateJWT } from '../helpers/generate-jwt.js';
import { sendWelcomeEmail } from '../helpers/email-helper.js';

/**
 * Registrar un nuevo usuario con validaciones de seguridad.
 */
export const register = async (req, res) => {
  const {
    name,
    surname,
    username,
    email,
    password,
    phone,
    dpi,
    address,
    jobName,
    monthlyIncome,
    role,
  } = req.body;

  try {
    // Verificar duplicados
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    const existingUsername = await User.findOne({ username: username.trim() });
    const errors = [];

    if (existingEmail) {
      errors.push({ message: 'El correo ya está registrado', value: email });
    }
    if (existingUsername) {
      errors.push({ message: 'El nombre de usuario ya está registrado', value: username });
    }
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Campos no válidos en la solicitud',
        errors,
      });
    }

    // Validaciones adicionales
    if (!dpi || dpi.trim().length !== 13) {
      return res.status(400).json({
        success: false,
        message: 'Campos no válidos en la solicitud',
        errors: [{ message: 'El DPI es requerido y debe tener 13 dígitos', value: dpi }],
      });
    }
    if (!address?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Campos no válidos en la solicitud',
        errors: [{ message: 'La dirección es requerida', value: address }],
      });
    }
    if (!jobName?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Campos no válidos en la solicitud',
        errors: [{ message: 'El nombre de trabajo es requerido', value: jobName }],
      });
    }
    if (monthlyIncome == null || monthlyIncome < 100) {
      return res.status(400).json({
        success: false,
        message: 'Campos no válidos en la solicitud',
        errors: [{ message: 'El ingreso mensual debe ser mayor a Q100', value: monthlyIncome }],
      });
    }

    // Hash de la contraseña
    const hashedPassword = await hash(password);

    // Crear usuario
    const user = await User.create({
      name: name.trim(),
      surname: surname.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone.trim(),
      dpi: dpi.trim(),
      address: address.trim(),
      jobName: jobName.trim(),
      monthlyIncome,
      role: role || 'USER_ROLE',
    });

    // Enviar correo de bienvenida (sin bloquear registro si falla)
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailErr) {
      console.error('Error al enviar correo:', emailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
      }
    });
  } catch (err) {
    console.error('Error durante el registro:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Error de validación', errors: messages });
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
      return res
        .status(400)
        .json({ success: false, message: 'Credenciales inválidas o cuenta desactivada' });
    }

    const valid = await verify(user.password, password);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Credenciales inválidas' });
    }

    const userDetails = user.toJSON();
    const token = await generateJWT(userDetails.id);

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      userDetails: { token, user: userDetails },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error en el servidor al iniciar sesión', error: err.message });
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

    const resetCode = crypto.randomInt(100000, 999999).toString();
    const expires = Date.now() + 3600 * 1000;

    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(expires);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Código para restablecer contraseña',
      text: `Tu código de recuperación es: ${resetCode}`,
    });

    return res.status(200).json({ success: true, message: 'Código enviado al email' });
  } catch (err) {
    console.error('Request reset error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error solicitando restablecimiento de contraseña', error: err.message });
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
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Código inválido o expirado' });
    }

    user.password = await hash(newPassword);
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: 'Contraseña restablecida correctamente' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error restableciendo la contraseña', error: err.message });
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
        dpi: '0000000000000',
        address: '',
        jobName: '',
        monthlyIncome: 100,
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
