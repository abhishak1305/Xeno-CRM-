const router = require('express').Router();
const fetch = require('node-fetch');
const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const Message = require('../models/Message');
const { buildFilter } = require('./segments');

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001';

// GET /api/campaigns — list all campaigns with stats
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('segmentId', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/campaigns/:id — single campaign detail
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segmentId', 'name description rules')
      .lean();
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/campaigns/:id/messages — messages for a campaign
router.get('/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ campaignId: req.params.id })
      .populate('customerId', 'name email phone')
      .sort({ sentAt: -1 })
      .lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/campaigns — create campaign and dispatch to channel service
router.post('/', async (req, res) => {
  try {
    const { name, segmentId, channel, messageTemplate } = req.body;

    // Validate segment exists and find matching customers
    const segment = await Segment.findById(segmentId);
    if (!segment) return res.status(400).json({ error: 'Segment not found' });

    const filter = buildFilter(segment.rules);
    const customers = await Customer.find(filter).lean();

    if (customers.length === 0) {
      return res.status(400).json({ error: 'No customers match this segment' });
    }

    // Create campaign
    const campaign = await Campaign.create({
      name, segmentId, channel, messageTemplate,
      status: 'running',
      stats: { sent: customers.length }
    });

    // Create message docs and dispatch to channel service
    const messageDocs = customers.map(c => ({
      campaignId: campaign._id,
      customerId: c._id,
      channel,
      recipient: channel === 'Email' ? c.email : c.phone,
      messageText: messageTemplate.replace(/\{\{name\}\}/g, c.name),
      status: 'sent',
      sentAt: new Date()
    }));

    const insertedMessages = await Message.insertMany(messageDocs);

    // Fire-and-forget: send each message to the channel service
    for (const msg of insertedMessages) {
      fetch(`${CHANNEL_SERVICE_URL}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: msg._id.toString(),
          campaignId: campaign._id.toString(),
          recipient: msg.recipient,
          messageText: msg.messageText,
          channel: msg.channel
        })
      }).catch(async err => {
        console.error('Channel dispatch error:', err.message);
        // Mark as failed if the channel service is unreachable
        await Message.findByIdAndUpdate(msg._id, { status: 'failed', failedAt: new Date() });
        await Campaign.findByIdAndUpdate(campaign._id, { $inc: { 'stats.failed': 1 } });
      });
    }

    res.status(201).json({
      campaignId: campaign._id,
      name,
      recipientCount: customers.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/campaigns/callback — receive delivery callbacks from channel service
router.post('/callback', async (req, res) => {
  try {
    const { messageId, status, timestamp } = req.body;

    // Map status to the correct timestamp field
    const timeField = {
      delivered: 'deliveredAt',
      failed: 'failedAt',
      opened: 'openedAt',
      read: 'readAt',
      clicked: 'clickedAt',
      converted: 'convertedAt'
    }[status];

    if (!timeField) return res.status(400).json({ error: 'Invalid status' });

    // Get current message to know previous status
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const previousStatus = message.status;

    // Update message
    await Message.findByIdAndUpdate(messageId, {
      status,
      [timeField]: timestamp || new Date()
    });

    // Update campaign stats: increment the current status to keep it cumulative
    const incField = `stats.${status}`;

    await Campaign.findByIdAndUpdate(message.campaignId, {
      $inc: { [incField]: 1 }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
