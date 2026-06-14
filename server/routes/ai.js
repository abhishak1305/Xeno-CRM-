const router = require('express').Router();
const fetch = require('node-fetch');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Helper: Call OpenRouter LLM
async function callLLM(systemPrompt, userPrompt) {
  // If no API key, fall back to local rule-based logic
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.startsWith('your_') || OPENROUTER_API_KEY.includes('placeholder')) {
    return fallbackAI(userPrompt);
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://xeno-crm.onrender.com',
        'X-Title': 'Xeno CRM AI Copilot'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error('OpenRouter API Error:', data.error);
    }
    return data.choices?.[0]?.message?.content || fallbackAI(userPrompt);
  } catch (err) {
    console.error('OpenRouter error, using fallback:', err.message);
    return fallbackAI(userPrompt);
  }
}

// Fallback rule-based AI when no API key is configured
function fallbackAI(prompt) {
  const lower = prompt.toLowerCase();

  // If user provided a template/message directly (contains {{name}} or [name] or similar)
  if (lower.includes('{{name}}') || lower.includes('{{customer}}') || lower.includes('[name]')) {
    return generateMessageFallback(prompt);
  }

  // Check if this is a segment parse request (contains spend/order/inactive keywords)
  if (lower.includes('spend') || lower.includes('order') || lower.includes('inactive') || lower.includes('bought') || lower.includes('purchase')) {
    return generateSegmentFallback(lower);
  }

  // Check if this is a message draft request
  if (lower.includes('message') || lower.includes('write') || lower.includes('draft') || lower.includes('campaign')) {
    return generateMessageFallback(prompt);
  }

  // General copilot response
  return JSON.stringify({
    type: 'suggestion',
    content: 'Based on your goal, I recommend creating a segment of high-value customers (spend > ₹5000) and sending them a personalized WhatsApp campaign with a loyalty reward.',
    suggestedSegment: { name: 'High Value Customers', rules: { minSpend: 5000 } },
    suggestedChannel: 'WhatsApp',
    suggestedMessage: 'Hey {{name}}! 🎉 As one of our most valued customers, enjoy an exclusive 20% off on your next purchase. Use code VIP20 at checkout!'
  });
}

function generateSegmentFallback(prompt) {
  const rules = {};

  // Parse spend amounts
  const spendMatch = prompt.match(/(?:spent?|spend)\s*(?:more than|over|above|>|at least)?\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (spendMatch) rules.minSpend = parseInt(spendMatch[1]);

  const maxSpendMatch = prompt.match(/(?:spent?|spend)\s*(?:less than|under|below|<)?\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (maxSpendMatch && !spendMatch) rules.maxSpend = parseInt(maxSpendMatch[1]);

  // Parse order count
  const orderMatch = prompt.match(/(?:ordered?|bought|purchase[ds]?)\s*(?:more than|over|at least)?\s*(\d+)\s*(?:times?|orders?)/i);
  if (orderMatch) rules.minOrders = parseInt(orderMatch[1]);

  // Parse recency
  const activeMatch = prompt.match(/(?:last|past|within|recent)\s*(\d+)\s*days?/i);
  if (activeMatch) {
    if (prompt.includes('inactive') || prompt.includes('not') || prompt.includes("haven't") || prompt.includes('churned') || prompt.includes('lapsed')) {
      rules.inactiveDays = parseInt(activeMatch[1]);
    } else {
      rules.lastOrderDaysAgo = parseInt(activeMatch[1]);
    }
  }

  // Default if nothing matched
  if (Object.keys(rules).length === 0) {
    rules.minSpend = 5000;
  }

  return JSON.stringify({
    type: 'segment',
    rules,
    suggestedName: generateSegmentName(rules)
  });
}

function generateSegmentName(rules) {
  const parts = [];
  if (rules.minSpend) parts.push(`High Spenders (>₹${rules.minSpend})`);
  if (rules.maxSpend) parts.push(`Budget Shoppers (<₹${rules.maxSpend})`);
  if (rules.minOrders) parts.push(`Repeat Buyers (${rules.minOrders}+ orders)`);
  if (rules.lastOrderDaysAgo) parts.push(`Recently Active (${rules.lastOrderDaysAgo}d)`);
  if (rules.inactiveDays) parts.push(`Inactive (${rules.inactiveDays}d+)`);
  return parts.join(' · ') || 'Custom Segment';
}

function redraftMessageOffline(prompt) {
  let messageText = prompt;
  
  // Clean prefixes if user has instructions like "Draft message: Hey {{name}}! ..."
  const nameIndex = prompt.indexOf('{{name}}');
  if (nameIndex !== -1) {
    messageText = prompt.replace(/^(draft|rewrite|write|message|template|redraft|please rewrite|please draft|could you rewrite|could you draft)\s*(this)?\s*[:\-]?\s*/i, '');
  }

  // If prompt does not contain {{name}}, construct a new draft based on parameters
  if (!messageText.includes('{{name}}')) {
    // Try to extract discount percent
    const percentMatch = prompt.match(/(\d+)%/);
    const percent = percentMatch ? percentMatch[1] : '15';

    // Try to extract coupon code
    const codeMatch = prompt.match(/\b([A-Z]{3,}\d*|\b[A-Z0-9]{5,})\b/);
    const code = codeMatch ? codeMatch[0] : `SAVE${percent}`;

    // Try to extract inactivity/recency
    const inactive = prompt.toLowerCase().includes('inactive') || prompt.toLowerCase().includes('miss') || prompt.toLowerCase().includes('come back');

    if (inactive) {
      return `Hey {{name}}! 👋 We miss you at our store. Come back and enjoy a special ${percent}% off on your next purchase. Use code ${code} at checkout. Valid for 7 days!`;
    } else {
      return `Hey {{name}}! 🎉 As one of our most valued customers, enjoy an exclusive ${percent}% off on your next purchase. Use code ${code} at checkout!`;
    }
  }

  // If prompt has {{name}}, let's perform local synonym-based rewriting to redraft it.
  let drafted = messageText;

  const synonyms = [
    { pattern: /most valued/i, replacements: ['most loyal', 'top-tier', 'VIP'] },
    { pattern: /enjoy an? exclusive/i, replacements: ['unlock a special', 'claim your exclusive', 'grab a premium'] },
    { pattern: /enjoy/i, replacements: ['claim', 'grab', 'unlock'] },
    { pattern: /exclusive/i, replacements: ['special', 'premium', 'limited-time'] },
    { pattern: /purchase/i, replacements: ['order', 'shopping trip'] },
    { pattern: /at checkout/i, replacements: ['on your order', 'at checkout'] },
    { pattern: /🎉/g, replacements: ['✨', '🎁', '💖'] },
    { pattern: /👋/g, replacements: ['🎉', '✨'] },
    { pattern: /We miss you/i, replacements: ["It's been a while", "We'd love to see you again", "We've missed you"] },
    { pattern: /Come back and/i, replacements: ['Return today to', 'Come back to'] },
  ];

  let seed = prompt.length;
  synonyms.forEach(item => {
    if (item.pattern.test(drafted)) {
      const idx = seed % item.replacements.length;
      drafted = drafted.replace(item.pattern, item.replacements[idx]);
      seed += 3;
    }
  });

  if (!drafted.includes('{{name}}')) {
    drafted = 'Hey {{name}}! ' + drafted;
  }

  return drafted;
}

function generateMessageFallback(prompt) {
  const drafted = redraftMessageOffline(prompt);
  
  // Try to detect channel from prompt, defaulting to WhatsApp
  let channel = 'WhatsApp';
  const lower = prompt.toLowerCase();
  if (lower.includes('sms')) channel = 'SMS';
  else if (lower.includes('email') || lower.includes('mail')) channel = 'Email';
  else if (lower.includes('rcs')) channel = 'RCS';

  return JSON.stringify({
    type: 'message',
    draft: drafted,
    channel: channel
  });
}

// POST /api/ai/copilot — main AI entry point
router.post('/copilot', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const systemPrompt = `You are an AI Campaign Copilot for a CRM platform. Your job is to help marketers create targeted campaigns.

You MUST respond with valid JSON only. No markdown, no explanation outside JSON.

Based on the user's goal, respond with one of these JSON formats:

1. For segment/audience requests:
{
  "type": "segment",
  "rules": {
    "minSpend": number or null,
    "maxSpend": number or null,
    "minOrders": number or null,
    "lastOrderDaysAgo": number or null,
    "inactiveDays": number or null
  },
  "suggestedName": "string"
}

2. For message/campaign drafting:
{
  "type": "message",
  "draft": "message with {{name}} placeholder",
  "channel": "WhatsApp" | "SMS" | "Email" | "RCS"
}

3. For broad goals that need a full campaign suggestion:
{
  "type": "suggestion",
  "content": "brief strategy explanation",
  "suggestedSegment": { "name": "string", "rules": { ... } },
  "suggestedChannel": "WhatsApp" | "SMS" | "Email" | "RCS",
  "suggestedMessage": "message with {{name}} placeholder"
}

Use Indian Rupees (₹). Be creative with messages. Use emojis in WhatsApp/RCS messages.`;

    const aiResponse = await callLLM(systemPrompt, prompt);

    // Try to parse the AI response as JSON
    let parsed;
    try {
      // Handle case where LLM wraps JSON in markdown code blocks
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If parsing fails, return as raw suggestion
      parsed = { type: 'suggestion', content: aiResponse };
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/draft-message — generate message for a specific segment + channel
router.post('/draft-message', async (req, res) => {
  try {
    const { segmentName, channel, goal } = req.body;

    const systemPrompt = `You are a marketing copywriter for a CRM. Write a short, engaging ${channel} message for a customer segment called "${segmentName}". 
Use {{name}} as a placeholder for the customer name. Keep it under 160 chars for SMS, under 300 for others. Use emojis for WhatsApp and RCS. Be professional for Email.
Respond with JSON only: { "draft": "your message here" }`;

    const userPrompt = goal || `Write a personalized ${channel} message for the ${segmentName} segment to drive engagement.`;

    const aiResponse = await callLLM(systemPrompt, userPrompt);

    let parsed;
    try {
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
      if (!parsed.draft) {
        parsed.draft = parsed.suggestedMessage || parsed.content || JSON.stringify(parsed);
      }
    } catch {
      parsed = { draft: aiResponse };
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
