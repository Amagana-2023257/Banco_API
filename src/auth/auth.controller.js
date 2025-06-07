// src/controllers/auth.controller.js
import { hash, verify } from 'argon2';
import crypto from 'crypto';
import User from '../user/user.model.js';
import Account from '../account/account.model.js';
import { generateJWT } from '../helpers/generate-jwt.js';
import { sendWelcomeEmail } from '../helpers/email-helper.js';

/**
 * Registrar un nuevo usuario y crear automáticamente su cuenta
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
    // 1) Validar duplicados
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    const existingUsername = await User.findOne({ username: username.trim() });
    const errors = [];

    if (existingEmail) {
      errors.push({ field: 'email', message: 'El correo ya está registrado' });
    }
    if (existingUsername) {
      errors.push({ field: 'username', message: 'El nombre de usuario ya está en uso' });
    }
    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Campos no válidos en la solicitud',
        errors,
      });
    }

    // 2) Validaciones adicionales
    if (!/^[0-9]{13}$/.test(dpi.trim())) {
      return res.status(400).json({
        success: false,
        message: 'El DPI debe tener 13 dígitos',
        errors: [{ field: 'dpi', message: 'DPI inválido' }],
      });
    }
    if (!address?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'La dirección es requerida',
        errors: [{ field: 'address', message: 'Dirección requerida' }],
      });
    }
    if (!jobName?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de trabajo es requerido',
        errors: [{ field: 'jobName', message: 'Nombre de trabajo requerido' }],
      });
    }
    if (monthlyIncome == null || monthlyIncome < 100) {
      return res.status(400).json({
        success: false,
        message: 'El ingreso mensual debe ser al menos Q100',
        errors: [{ field: 'monthlyIncome', message: 'Ingreso mensual insuficiente' }],
      });
    }

    // 3) Hash de la contraseña
    const hashedPassword = await hash(password);

    // 4) Crear usuario
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
      role: role || 'CLIENTE',
    });

    // 5) Crear cuenta asociada
    const account = await Account.create({ user: user._id, currency: 'GTQ' });

    // 6) Enviar correo de bienvenida (no bloquear si falla)
    sendWelcomeEmail(user.email, user.name).catch(err =>
      console.error('Error al enviar correo de bienvenida:', err)
    );

    // 7) Responder con datos de usuario y cuenta
    return res.status(201).json({
      success: true,
      message: 'Registro exitoso; cuenta creada',
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        balance: account.balance,
        currency: account.currency,
      },
    });
  } catch (err) {
    console.error('Error en registro:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: 'Error de validación', errors: messages });
    }
    return res.status(500).json({ success: false, message: 'Error en el servidor', error: err.message });
  }
};

/**
 * Login de usuario
 */
export const login = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    // Buscar usuario por email o username
    const user = await User.findOne({
      $or: [{ email: email?.toLowerCase().trim() }, { username: username?.trim() }],
    });
    if (!user || !user.status) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales inválidas o cuenta desactivada',
      });
    }

    // Verificar contraseña
    const valid = await verify(user.password, password);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Generar JWT
    const { _id, name, role } = user;
    const token = await generateJWT(_id.toString(), name, role);

    // Construir payload de usuario seguro
    const userPayload = {
      id: _id.toString(),
      name: user.name,
      surname: user.surname,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      userDetails: {
        token,
        user: userPayload,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor al iniciar sesión',
      error: err.message,
    });
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
 * Crear usuarios por defecto para cada rol (ejecutar una sola vez)
 */
export const createDefaultUsers = async () => {
  const defaultDefs = [
    { key: 'ADMIN_GLOBAL', name: 'Super Admin Global', email: 'admin_global@banca.com', username: 'admin_global' },
    { key: 'GERENTE_SUCURSAL', name: 'Gerente de Sucursal', email: 'gerente_sucursal@banca.com', username: 'gerente_sucursal' },
    { key: 'CAJERO', name: 'Cajero Principal', email: 'cajero@banca.com', username: 'cajero' },
    { key: 'CLIENTE', name: 'Cliente Base', email: 'cliente@banca.com', username: 'cliente' },
  ];

  for (const { key, name, email, username } of defaultDefs) {
    try {
      const exists = await User.findOne({
        $or: [ { role: key }, { email }, { username } ],
      });
      if (exists) {
        console.log(`Usuario por defecto ${key} ya existe.`);
        continue;
      }
      const pwdPlain = 'Password123!';
      const hashedPwd = await hash(pwdPlain);

      // Generar DPI único de 13 dígitos
      const uniqueDpi = crypto.randomInt(1e12, 1e13 - 1).toString().padStart(13, '0');

      const u = new User({
        name,
        surname: 'Default',
        username,
        email,
        password: hashedPwd,
        phone: '00000000',
        dpi: uniqueDpi,
        address: 'N/A',
        jobName: `${key} Default`,
        monthlyIncome: 100,
        role: key,
      });
      await u.save();
      console.log(`✅ Creado default user ${key} (${username}) con password: ${pwdPlain}`);
    } catch (e) {
      console.error(`❌ Error creando default user ${key}:`, e.message);
    }
  }
};

export default createDefaultUsers;