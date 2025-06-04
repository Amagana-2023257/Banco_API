// src/helpers/email-helper.js
import nodemailer from 'nodemailer';

// Crear un transporte de correo usando Gmail (o cualquier otro proveedor de correo)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',  // Puedes usar otros proveedores de correo como SendGrid, Mailgun, etc.
    auth: {
      user: process.env.EMAIL_USER,  // El correo de envío
      pass: process.env.EMAIL_PASS,  // La contraseña o el token de aplicación
    },
  });
};

/**
 * Enviar un correo electrónico.
 * @param {Object} options - Opciones del correo electrónico (to, subject, text, html).
 * @returns {Promise} - Promesa que se resuelve si el correo se envía correctamente, o se rechaza con un error.
 */
export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER, // El correo desde el cual se enviará
    ...options, // Asumimos que se pasan al menos `to`, `subject`, y `text` o `html`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo enviado: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error('Error al enviar correo:', error);
    throw new Error('Error al enviar el correo');
  }
};

/**
 * Enviar un correo de bienvenida al usuario.
 * @param {String} to - Correo electrónico del destinatario.
 * @param {String} userName - Nombre del usuario al que se le enviará el correo.
 * @returns {Promise} - Promesa que se resuelve si el correo de bienvenida se envía correctamente, o se rechaza con un error.
 */
export const sendWelcomeEmail = async (to, userName) => {
  const subject = 'Bienvenido a nuestro servicio';
  const text = `Hola ${userName},\n\nTu cuenta ha sido creada exitosamente.\n\nAtentamente, el equipo.`;
  const html = `<p>Hola <strong>${userName}</strong>,</p><p>Tu cuenta ha sido creada exitosamente.</p><p>Atentamente, el equipo.</p>`;

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

/**
 * Enviar un correo para restablecer la contraseña.
 * @param {String} to - Correo electrónico del destinatario.
 * @param {String} resetCode - Código para restablecer la contraseña.
 * @returns {Promise} - Promesa que se resuelve si el correo de restablecimiento de contraseña se envía correctamente.
 */
export const sendResetPasswordEmail = async (to, resetCode) => {
  const subject = 'Restablecer tu contraseña';
  const text = `Tu código de restablecimiento de contraseña es: ${resetCode}`;
  const html = `<p>Tu código de restablecimiento de contraseña es: <strong>${resetCode}</strong></p>`;

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};
