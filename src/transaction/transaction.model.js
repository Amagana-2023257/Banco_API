// src/models/transaction.model.js
import { Schema, model } from 'mongoose';

const transactionSchema = new Schema({
  // Ahora referenciamos la cuenta, no directamente al usuario
  account: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },

  type: {
    type: String,
    enum: ['DEPOSITO', 'TRANSFERENCIA', 'COMPRA', 'CREDITO'],
    required: true,
  },

  amount: {
    type: Number,
    required: true,
    min: [0, 'El monto debe ser positivo'],
  },

  // En transferencias o créditos, la cuenta relacionada
  relatedAccount: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    default: null,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  reversed: {
    type: Boolean,
    default: false,
  },
}, {
  versionKey: false,
  timestamps: true,
});

export default model('Transaction', transactionSchema);
