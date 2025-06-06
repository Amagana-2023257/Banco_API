// src/helpers/email-helper.js
import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Enviar un correo electrónico.
 */
export const sendEmail = async (options) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('sendEmail: credenciales SMTP no configuradas, se omite envío de correo');
    return { success: false };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM,
    ...options,
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
 */
export const sendWelcomeEmail = async (to, userName) => {
  const subject = 'Bienvenido a nuestro servicio';
  const text = `Hola ${userName},\n\nTu cuenta ha sido creada exitosamente.\n\nAtentamente, el equipo.`;
  const html = `<p>Hola <strong>${userName}</strong>,</p><p>Tu cuenta ha sido creada exitosamente.</p><p>Atentamente, el equipo.</p>`;

  return sendEmail({ to, subject, text, html });
};

/**
 * Enviar un correo para restablecer la contraseña.
 */
export const sendResetPasswordEmail = async (to, resetCode) => {
  const subject = 'Restablecer tu contraseña';
  const text = `Tu código de restablecimiento de contraseña es: ${resetCode}`;
  const html = `<p>Tu código de restablecimiento de contraseña es: <strong>${resetCode}</strong></p>`;

  return sendEmail({ to, subject, text, html });
};
