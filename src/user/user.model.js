// src/models/user.model.js
import { Schema, model } from 'mongoose';
import crypto from 'crypto';  // Para generar un número de cuenta aleatorio

// Función para generar un número de cuenta aleatorio
const generateAccountNumber = () => {
  return crypto.randomBytes(6).toString('hex').toUpperCase();  // Genera un código aleatorio de 12 caracteres hexadecimales
};

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    maxlength: [50, 'El nombre no debe superar 50 caracteres'],
    trim: true
  },
  surname: {
    type: String,
    required: [true, 'El apellido es requerido'],
    maxlength: [50, 'El apellido no debe superar 50 caracteres'],
    trim: true
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
    default: generateAccountNumber
  },
  dpi: {
    type: String,
    required: [true, 'El DPI es requerido'],
    unique: true,
    trim: true,
    validate: {
      validator: function(value) {
        return /^\d{13}$/.test(value);  // Validación para que sea un DPI de 13 dígitos
      },
      message: 'El DPI debe ser un número de 13 dígitos'
    }
  },
  address: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true,
    maxlength: [100, 'La dirección no debe superar 100 caracteres']
  },
  phone: {
    type: String,
    required: [true, 'El número de celular es requerido'],
    trim: true,
    validate: {
      validator: function(value) {
        return /^[0-9]{8}$/.test(value);  // Validación para 8 dígitos del número de celular
      },
      message: 'El número de celular debe tener 8 dígitos'
    }
  },
  email: {
    type: String,
    required: [true, 'El correo es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(value) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);  // Validación del formato de correo electrónico
      },
      message: 'El correo electrónico no es válido'
    }
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
    trim: true
  },
  monthlyIncome: {
    type: Number,
    required: [true, 'Los ingresos mensuales son requeridos'],
    min: [100, 'El ingreso mensual no puede ser menor a Q100'],  // Validación de ingresos mínimos
  },
  status: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: null,
    trim: true
  },
  passwordResetCode: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  }
}, {
  versionKey: false,
  timestamps: true
});

// Método toJSON personalizado para excluir campos sensibles al momento de responder los datos del usuario
userSchema.methods.toJSON = function() {
  const { _id, __v, password, passwordResetCode, passwordResetExpires, ...user } = this.toObject();
  user.id = _id;
  return user;
};

export default model('User', userSchema);
