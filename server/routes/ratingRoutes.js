const express = require('express');
const Rating = require('../models/Rating');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/ratings/product/:productId  - public: all ratings for a product
router.get('/product/:productId', async (req, res, next) => {
  try {
    const ratings = await Rating.find({ product: req.params.productId }).populate('user', 'name');
    res.json(ratings);
  } catch (err) {
    next(err);
  }
});

// @route GET /api/ratings/mine  - logged in user's own ratings (order+product pairs only)
router.get('/mine', protect, async (req, res, next) => {
  try {
    const ratings = await Rating.find({ user: req.user._id }).select('order product');
    res.json(ratings);
  } catch (err) {
    next(err);
  }
});

// @route POST /api/ratings  - { productId, orderId, stars, comment }
router.post('/', protect, async (req, res, next) => {
  try {
    const { productId, orderId, stars, comment } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Stars must be between 1 and 5' });
    }

    // verify the order belongs to this user and actually contains this product
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const boughtIt = order.items.some((i) => i.product.toString() === productId);
    if (!boughtIt) {
      return res.status(403).json({ message: 'You can only rate products you purchased' });
    }

    const rating = await Rating.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      stars,
      comment,
    });

    // recalculate product's average rating
    const allRatings = await Rating.find({ product: productId });
    const avg = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;
    await Product.findByIdAndUpdate(productId, {
      avgRating: avg,
      numRatings: allRatings.length,
    });

    res.status(201).json(rating);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You already rated this product for this order' });
    }
    next(err);
  }
});

module.exports = router;
