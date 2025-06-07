// src/controllers/account.controller.js
import Account from './account.model.js';
import User from '../user/user.model.js';

/**
 * Crear una nueva cuenta para un usuario existente
 */
export const createAccount = async (req, res) => {
  const { userId, currency } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || !user.status) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado o inactivo' });
    }
    const existing = await Account.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'El usuario ya tiene una cuenta creada' });
    }
    const acct = await Account.create({ user: userId, currency });
    res.status(201).json({ success: true, account: acct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al crear la cuenta', error: err.message });
  }
};

/**
 * Obtener todas las cuentas
 */
export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find().populate('user', 'name surname email');
    res.status(200).json({ success: true, accounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener las cuentas', error: err.message });
  }
};

/**
 * Obtener una cuenta por ID
 */
export const getAccountById = async (req, res) => {
  const { id } = req.params;
  try {
    const acct = await Account.findById(id).populate('user', 'name surname email');
    if (!acct) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }
    res.status(200).json({ success: true, account: acct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener la cuenta', error: err.message });
  }
};

/**
 * Actualizar datos de la cuenta (por ejemplo estado o moneda)
 */
export const updateAccount = async (req, res) => {
  const { id } = req.params;
  const updates = (({ currency, status }) => ({ currency, status }))(req.body);
  try {
    const acct = await Account.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!acct) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }
    res.status(200).json({ success: true, account: acct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al actualizar la cuenta', error: err.message });
  }
};

/**
 * Desactivar (eliminar suave) una cuenta
 */
export const deactivateAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const acct = await Account.findById(id);
    if (!acct || !acct.status) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada o ya desactivada' });
    }
    acct.status = false;
    await acct.save();
    res.status(200).json({ success: true, message: 'Cuenta desactivada', account: acct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al desactivar la cuenta', error: err.message });
  }
};
