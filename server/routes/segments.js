const router = require('express').Router();
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');

// Build a Mongoose filter from segment rules
function buildFilter(rules) {
  const filter = {};

  if (rules.minSpend != null && rules.minSpend !== '') {
    filter.totalSpend = { ...filter.totalSpend, $gte: Number(rules.minSpend) };
  }
  if (rules.maxSpend != null && rules.maxSpend !== '') {
    filter.totalSpend = { ...filter.totalSpend, $lte: Number(rules.maxSpend) };
  }
  if (rules.minOrders != null && rules.minOrders !== '') {
    filter.orderCount = { ...filter.orderCount, $gte: Number(rules.minOrders) };
  }
  if (rules.lastOrderDaysAgo != null && rules.lastOrderDaysAgo !== '') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(rules.lastOrderDaysAgo));
    filter.lastOrderDate = { ...filter.lastOrderDate, $gte: cutoff };
  }
  if (rules.inactiveDays != null && rules.inactiveDays !== '') {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(rules.inactiveDays));
    filter.lastOrderDate = { ...filter.lastOrderDate, $lt: cutoff };
  }

  return filter;
}

// GET /api/segments — list all segments
router.get('/', async (req, res) => {
  try {
    const segments = await Segment.find().sort({ createdAt: -1 }).lean();
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/segments — create a segment
router.post('/', async (req, res) => {
  try {
    const { name, description, rules } = req.body;
    const filter = buildFilter(rules);
    const customerCount = await Customer.countDocuments(filter);

    const segment = await Segment.create({ name, description, rules, customerCount });
    res.status(201).json(segment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/segments/evaluate — preview how many customers match given rules
router.post('/evaluate', async (req, res) => {
  try {
    const { rules } = req.body;
    const filter = buildFilter(rules);
    const count = await Customer.countDocuments(filter);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/segments/:id/customers — get customers matching a saved segment
router.get('/:id/customers', async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) return res.status(404).json({ error: 'Segment not found' });

    const filter = buildFilter(segment.rules);
    const customers = await Customer.find(filter).lean();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export buildFilter for use in campaign routes
router.buildFilter = buildFilter;

module.exports = router;
