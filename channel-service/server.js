require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const CRM_CALLBACK_URL = process.env.CRM_CALLBACK_URL || 'http://localhost:5000/api/campaigns/callback';

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'channel-simulator' });
});

/**
 * POST /api/send
 */
app.post('/api/send', (req, res) => {
  const { messageId, campaignId, recipient, messageText, channel } = req.body;

  if (!messageId) {
    return res.status(400).json({ error: 'messageId is required' });
  }

  // Acknowledge receipt immediately
  res.json({ accepted: true, messageId });

  // Begin async simulation or real send
  simulateLifecycle(messageId, channel, recipient, messageText, campaignId);
});

async function simulateLifecycle(messageId, channel, recipient, messageText, campaignId) {
  // Random delay helper (ms)
  const delay = (min, max) => new Promise(r => setTimeout(r, min + Math.random() * (max - min)));

  // Helper to send callback to CRM
  async function sendCallback(status) {
    try {
      await fetch(CRM_CALLBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          status,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error(`Callback failed for ${messageId} → ${status}:`, err.message);
    }
  }

  // Stage 1: Delivery
  if (channel === 'Email') {
    try {
      const info = await transporter.sendMail({
        from: `"Xeno CRM" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `New Message regarding Campaign ${campaignId.slice(-4)}`,
        text: messageText,
        html: `<div style="font-family: sans-serif; color: #333;"><p>${messageText.replace(/\n/g, '<br/>')}</p></div>`
      });
      
      if (info.rejected && info.rejected.length > 0) {
        console.error(`Email rejected by SMTP for ${recipient}`);
        await sendCallback('failed');
        return;
      }

      console.log(`Email successfully sent to ${recipient}`);
      await sendCallback('delivered');
    } catch (err) {
      console.error(`Failed to send email to ${recipient}:`, err);
      await sendCallback('failed');
      return; // end lifecycle
    }
  } else {
    // Simulate Delivery for non-email channels (1-3s delay)
    await delay(1000, 3000);
    const delivered = Math.random() < 0.90;

    if (!delivered) {
      await sendCallback('failed');
      return; // End lifecycle
    }

    await sendCallback('delivered');
  }

  // Stage 2: Opened (2-5s delay)
  await delay(2000, 5000);
  if (Math.random() >= 0.70) return; // Not opened
  await sendCallback('opened');

  // Stage 3: Read (1-3s delay)
  await delay(1000, 3000);
  if (Math.random() >= 0.65) return; // Not read
  await sendCallback('read');

  // Stage 4: Clicked (2-6s delay)
  await delay(2000, 6000);
  if (Math.random() >= 0.35) return; // Not clicked
  await sendCallback('clicked');

  // Stage 5: Converted (3-8s delay)
  await delay(3000, 8000);
  if (Math.random() >= 0.20) return; // Not converted
  await sendCallback('converted');
}

// Start
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Channel Simulator running on http://localhost:${PORT}`);
});
