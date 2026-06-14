const router = require('express').Router();
const Customer = require('../models/Customer');
const Campaign = require('../models/Campaign');
const Message = require('../models/Message');

// GET /api/stats — aggregate dashboard metrics
router.get('/', async (req, res) => {
  try {
    const [totalCustomers, totalCampaigns] = await Promise.all([
      Customer.countDocuments(),
      Campaign.countDocuments()
    ]);

    // Aggregate message stats across all campaigns
    const msgStats = await Message.aggregate([
      {
        $group: {
          _id: null,
          total:     { $sum: 1 },
          delivered: { $sum: { $cond: [{ $in: ['$status', ['delivered', 'opened', 'read', 'clicked', 'converted']] }, 1, 0] } },
          failed:    { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          opened:    { $sum: { $cond: [{ $in: ['$status', ['opened', 'read', 'clicked', 'converted']] }, 1, 0] } },
          clicked:   { $sum: { $cond: [{ $in: ['$status', ['clicked', 'converted']] }, 1, 0] } },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      }
    ]);

    const s = msgStats[0] || { total: 0, delivered: 0, failed: 0, opened: 0, clicked: 0, converted: 0 };

    res.json({
      totalCustomers,
      totalCampaigns,
      totalMessages: s.total,
      totalDelivered: s.delivered,
      totalFailed: s.failed,
      totalOpened: s.opened,
      totalClicked: s.clicked,
      totalConverted: s.converted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
