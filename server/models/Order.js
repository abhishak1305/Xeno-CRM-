const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount:     { type: Number, required: true },
  items:      { type: String },
  status:     { type: String, default: 'completed' },
  orderDate:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
