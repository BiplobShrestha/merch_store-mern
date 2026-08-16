const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        image: String,
        quantity: Number,
      },
    ],
    total: { type: Number, required: true },
    discountCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    region: {
      type: String,
      enum: ['Kathmandu', 'Pokhara', 'Butwal', 'Birgunj', 'Biratnagar', 'Itahari', 'Nepalgunj'],
      required: true,
    },
    approvedAt: { type: Date, default: null },
    route: {
      waypoints: [{ type: String }],
      edgeDistances: [{ type: Number }],
      distanceKm: { type: Number },
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
