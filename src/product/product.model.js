// src/models/product.model.js
import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  createdAt: { type: Date, default: Date.now }
});

export default model('Product', productSchema);