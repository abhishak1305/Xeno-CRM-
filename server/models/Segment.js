const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  rules:       { type: mongoose.Schema.Types.Mixed, required: true },
  customerCount: { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Segment', segmentSchema);
