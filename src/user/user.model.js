// src/models/user.model.js
import { Schema, model } from 'mongoose';
import crypto from 'crypto';

// Genera un número de cuenta aleatorio de 12 caracteres hex
const generateAccountNumber = () => crypto.randomBytes(6).toString('hex').toUpperCase();

const userSchema = new Schema({
  // Rol del usuario: USER_ROLE o ADMIN_GLOBAL
  role: {
    type: String,
    required: [true, 'El rol es requerido'],
    enum: ['ADMIN_GLOBAL', 'GERENTE_SUCURSAL', 'CAJERO', 'CLIENTE'],
    default: 'CLIENTE',
    trim: true,
  },
  
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    maxlength: [50, 'El nombre no debe superar 50 caracteres'],
    trim: true,
  },

  surname: {
    type: String,
    required: [true, 'El apellido es requerido'],
    maxlength: [50, 'El apellido no debe superar 50 caracteres'],
    trim: true,
  },

  username: {
    type: String,
    required: [true, 'El nombre de usuario es requerido'],
    unique: true,
    trim: true,
    maxlength: [50, 'El nombre de usuario no debe superar 50 caracteres'],
  },

  accountNumber: {
    type: String,
    required: true,
    unique: true,
    default: generateAccountNumber,
  },

  dpi: {
    type: String,
    required: [true, 'El DPI es requerido'],
    unique: true,
    trim: true,
    validate: {
      validator: v => /^\d{13}$/.test(v),
      message: 'El DPI debe ser un número de 13 dígitos',
    },
  },

  address: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true,
    maxlength: [100, 'La dirección no debe superar 100 caracteres'],
  },

  phone: {
    type: String,
    required: [true, 'El número de celular es requerido'],
    trim: true,
    validate: {
      validator: v => /^[0-9]{8}$/.test(v),
      message: 'El número de celular debe tener 8 dígitos',
    },
  },

  email: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
      message: 'El correo electrónico no es válido',
    },
  },

  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
  },

  jobName: {
    type: String,
    required: [true, 'El nombre de trabajo es requerido'],
    maxlength: [50, 'El nombre de trabajo no debe superar 50 caracteres'],
    trim: true,
  },

  monthlyIncome: {
    type: Number,
    required: [true, 'Los ingresos mensuales son requeridos'],
    min: [100, 'El ingreso mensual no puede ser menor a Q100'],
  },

  status: {
    type: Boolean,
    default: true,
  },

  profilePicture: {
    type: String,
    default: null,
    trim: true,
  },

  passwordResetCode: {
    type: String,
    default: null,
  },

  passwordResetExpires: {
    type: Date,
    default: null,
  },
}, {
  versionKey: false,
  timestamps: true,
});

// Excluir campos sensibles al serializar
userSchema.methods.toJSON = function() {
  const { _id, __v, password, passwordResetCode, passwordResetExpires, ...user } = this.toObject();
  user.id = _id.toString();
  return user;
};

export default model('User', userSchema);
