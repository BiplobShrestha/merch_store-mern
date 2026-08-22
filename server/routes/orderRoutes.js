const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');
const { MAIN_WAREHOUSE, findNearestWarehouse } = require('../utils/warehouses');

const router = express.Router();

// @route POST /api/orders  - checkout: turns cart into an order
router.post('/', protect, async (req, res, next) => {
  try {
    const { lat, lng } = req.body?.deliveryLocation || {};
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'Please set your delivery location on the map' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const VALID_PROMO_CODES = { SAVE10: 0.1 };
    const rawCode = (req.body?.promoCode || '').trim().toUpperCase();
    const discountRate = VALID_PROMO_CODES[rawCode] || 0;
    const appliedCode = discountRate > 0 ? rawCode : undefined;

    const orderItems = [];
    let total = 0;

    // check stock and build order items
    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity,
      });
      total += product.price * item.quantity;
    }

    // decrement stock atomically for each product
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updated) {
        return res.status(400).json({ message: `Stock changed for ${item.name}, please retry` });
      }
    }

    const discountAmount = Math.round(total * discountRate);
    const finalTotal = total - discountAmount;

    // Assign nearest warehouse immediately - static calculation, no live tracking involved.
    const { warehouse, distanceKm } = findNearestWarehouse({ lat, lng });

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      total: finalTotal,
      discountCode: appliedCode,
      discountAmount,
      deliveryLocation: { lat, lng },
      assignedWarehouse: warehouse,
      distanceToWarehouseKm: distanceKm,
    });

    // clear the cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// @route GET /api/orders/mine  - logged in user's order history
router.get('/mine', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// @route GET /api/orders  - admin: all orders
router.get('/', protect, admin, async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/orders/:id/status  - admin: update order status
router.put('/:id/status', protect, admin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// @route DELETE /api/orders/:id  - admin: delete an order
router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/orders/:id/warehouse  - main warehouse + this order's assigned warehouse info (owner or admin only)
router.get('/:id/warehouse', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({
      mainWarehouse: MAIN_WAREHOUSE,
      assignedWarehouse: order.assignedWarehouse,
      deliveryLocation: order.deliveryLocation,
      distanceToWarehouseKm: order.distanceToWarehouseKm,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
