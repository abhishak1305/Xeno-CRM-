const router = require('express').Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');

// GET /api/orders — list recent orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email')
      .sort({ orderDate: -1 })
      .limit(100)
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — create a new order and update customer aggregates
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);

    // Update customer spend and order count
    await Customer.findByIdAndUpdate(order.customerId, {
      $inc: { totalSpend: order.amount, orderCount: 1 },
      $max: { lastOrderDate: order.orderDate || new Date() }
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
