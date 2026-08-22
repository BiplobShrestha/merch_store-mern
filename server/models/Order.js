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
    deliveryLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    assignedWarehouse: {
      name: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    distanceToWarehouseKm: { type: Number },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
