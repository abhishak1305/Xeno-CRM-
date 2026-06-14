const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  campaignId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  customerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  channel:     { type: String, required: true },
  recipient:   { type: String, required: true },
  messageText: { type: String, required: true },
  status:      { type: String, enum: ['sent', 'delivered', 'failed', 'opened', 'read', 'clicked', 'converted'], default: 'sent' },
  sentAt:      { type: Date },
  deliveredAt: { type: Date },
  failedAt:    { type: Date },
  openedAt:    { type: Date },
  readAt:      { type: Date },
  clickedAt:   { type: Date },
  convertedAt: { type: Date }
});

// Index for fast campaign-level queries
messageSchema.index({ campaignId: 1, status: 1 });

module.exports = mongoose.model('Message', messageSchema);
