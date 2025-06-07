// src/controllers/product.controller.js
import Product from '../models/product.model.js';


export const listProducts = async (req, res) => res.json({ products: await Product.find() });
export const createProduct = async (req, res) => { const p=new Product(req.body); await p.save(); res.json({ p }); };
