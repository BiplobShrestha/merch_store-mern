const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/products  (public - supports ?search=&category=)
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// @route GET /api/products/:id  (public)
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// @route POST /api/products  (admin only)
router.post('/', protect, admin, async (req, res, next) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const product = await Product.create({ name, description, price, image, category, stock });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/products/:id  (admin only)
router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const fields = ['name', 'description', 'price', 'image', 'category', 'stock'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    });

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// @route DELETE /api/products/:id  (admin only)
router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
