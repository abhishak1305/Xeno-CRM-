const router = require('express').Router();
const Customer = require('../models/Customer');

// GET /api/customers — list all customers, newest first
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ totalSpend: -1 }).lean();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/customers — create a new customer
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/customers/bulk — bulk ingest customers
router.post('/bulk', async (req, res) => {
  try {
    const { customers } = req.body;
    const result = await Customer.insertMany(customers, { ordered: false });
    res.status(201).json({ inserted: result.length });
  } catch (err) {
    // insertMany with ordered:false may throw but still insert some docs
    res.status(207).json({ error: err.message, insertedCount: err.insertedDocs?.length || 0 });
  }
});

module.exports = router;
