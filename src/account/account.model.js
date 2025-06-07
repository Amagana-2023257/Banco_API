// src/models/account.model.js
import { Schema, model } from 'mongoose';
import crypto from 'crypto';

// Genera un número de cuenta aleatorio de 12 caracteres hex
const generateAccountNumber = () =>
  crypto.randomBytes(6).toString('hex').toUpperCase();

const accountSchema = new Schema({
  // Referencia al usuario propietario de la cuenta
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,  // un usuario → una cuenta
  },

  // Número de cuenta (ya lo generaba User, pero lo mantenemos aquí)
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    default: generateAccountNumber,
  },

  // Saldo actual de la cuenta
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'El saldo no puede ser negativo'],
  },

  // Moneda (opcional, por defecto quetzales)
  currency: {
    type: String,
    required: true,
    default: 'GTQ',
    uppercase: true,
    trim: true,
  },

  // Estado de la cuenta: activa/inactiva
  status: {
    type: Boolean,
    default: true,
  },
}, {
  versionKey: false,
  timestamps: true,
});

// Excluir campos sensibles al serializar (aquí no hay password)
accountSchema.methods.toJSON = function() {
  const { _id, __v, ...acct } = this.toObject();
  acct.id = _id.toString();
  return acct;
};

export default model('Account', accountSchema);
