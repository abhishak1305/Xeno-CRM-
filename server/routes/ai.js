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

  // Check if this is an image prompt generation request
  if (lower.includes('image') || lower.includes('visual') || lower.includes('banner') || lower.includes('creative') || lower.includes('poster') || lower.includes('graphic') || lower.includes('generate an image') || lower.includes('design a')) {
    return generateImagePromptFallback(prompt);
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

// ─── Image Prompt Generator (Fallback) ───────────────────────────────────────
function generateImagePromptFallback(userInput) {
  const lower = userInput.toLowerCase();

  // Step 1 — Identify business objective
  let objective = 'general engagement';
  let objectiveLabel = 'Customer Engagement';
  if (lower.includes('churn') || lower.includes('bring back') || lower.includes('win back') || lower.includes('lapsed') || lower.includes('inactive') || lower.includes('reactivat') || lower.includes('return')) {
    objective = 'churn_reduction';
    objectiveLabel = 'Churn Reduction & Win-Back';
  } else if (lower.includes('upsell') || lower.includes('cross-sell') || lower.includes('upgrade') || lower.includes('premium')) {
    objective = 'upselling';
    objectiveLabel = 'Upselling & Cross-Selling';
  } else if (lower.includes('retain') || lower.includes('loyal') || lower.includes('reward') || lower.includes('vip') || lower.includes('valued')) {
    objective = 'retention';
    objectiveLabel = 'Customer Retention & Loyalty';
  } else if (lower.includes('acqui') || lower.includes('new customer') || lower.includes('sign up') || lower.includes('onboard') || lower.includes('welcome') || lower.includes('first')) {
    objective = 'acquisition';
    objectiveLabel = 'User Acquisition & Onboarding';
  } else if (lower.includes('sale') || lower.includes('discount') || lower.includes('offer') || lower.includes('deal') || lower.includes('flash')) {
    objective = 'promotion';
    objectiveLabel = 'Promotional Campaign';
  } else if (lower.includes('festival') || lower.includes('diwali') || lower.includes('holi') || lower.includes('christmas') || lower.includes('new year') || lower.includes('holiday') || lower.includes('season')) {
    objective = 'seasonal';
    objectiveLabel = 'Seasonal / Festival Campaign';
  }

  // Step 2 — Build visual narrative for each objective
  const narratives = {
    churn_reduction: {
      subject: 'A warm, inviting open door glowing with golden light, with a silhouette of a person stepping back through it. A gift box and a "Welcome Back" ribbon float gently in the air.',
      style: 'Modern digital illustration, clean flat design with subtle 3D depth, soft gradients, warm and inviting mood',
      palette: 'Warm amber, soft coral, cream white, touches of forest green to convey renewal and warmth',
      brandContext: 'E-commerce or retail brand win-back campaign — visual should evoke nostalgia, forgiveness, and a fresh start',
      emotions: 'Warmth, belonging, excitement to return, second chance, renewed connection',
      composition: 'Center-focused open door with radial light rays, shallow depth-of-field blur on background, space on the right third for overlay text. 16:9 landscape ratio, 4K resolution, suitable for email hero banner and social media ad.'
    },
    upselling: {
      subject: 'A stylish shopping bag transforming into a treasure chest overflowing with premium items — watches, electronics, fashion accessories — with sparkle effects and an upward arrow motif.',
      style: 'Premium 3D render with glass morphism elements, luxurious textures, high-end product photography feel',
      palette: 'Deep navy blue, rich gold, platinum silver, subtle purple gradients for luxury feel',
      brandContext: 'Premium tier upgrade or cross-sell campaign — visual should communicate aspirational value and exclusivity',
      emotions: 'Aspiration, luxury, excitement, exclusivity, smart upgrade',
      composition: 'Dynamic diagonal composition with the treasure chest in the lower-left third opening toward upper-right, sparkle particles filling the frame. 1:1 square and 16:9 versions, 4K, optimized for push notifications and in-app banners.'
    },
    retention: {
      subject: 'A golden loyalty card or VIP badge surrounded by floating hearts, stars, and confetti. A pair of hands cupping the badge gently, symbolizing care and appreciation.',
      style: 'Warm editorial illustration with watercolor textures, hand-crafted feel mixed with modern geometric accents',
      palette: 'Royal purple, gold, soft pink, ivory white — communicating prestige and affection',
      brandContext: 'VIP loyalty program or customer appreciation campaign — should feel exclusive yet personal',
      emotions: 'Gratitude, pride, belonging, celebration, personal recognition',
      composition: 'Centered badge/card with symmetrical confetti burst, soft bokeh background, generous white space at top for headline text. 16:9 and 9:16 vertical versions, 4K resolution, print and digital ready.'
    },
    acquisition: {
      subject: 'A vibrant, colorful welcome mat at a modern storefront with diverse, smiling people walking through a futuristic glass doorway. Floating UI elements show a sign-up form and a welcome discount badge.',
      style: 'Bright, optimistic flat illustration with isometric perspective, tech-forward and inclusive feel',
      palette: 'Electric blue, vibrant orange, fresh green, white — energetic and trustworthy',
      brandContext: 'New user onboarding or first-purchase campaign — visual should lower barriers and feel easy, fun, and rewarding',
      emotions: 'Curiosity, excitement, trust, inclusivity, fresh start',
      composition: 'Wide-angle isometric scene, storefront on the left third, people flowing in from right, floating UI elements in upper area. 16:9 landscape, 4K, web hero and paid ad optimized.'
    },
    promotion: {
      subject: 'An explosive sale burst with shopping bags, price tags showing slashed prices, and a giant countdown timer. Colorful confetti and lightning bolt accents emphasize urgency.',
      style: 'Bold pop-art inspired with dynamic comic-book energy, high contrast, eye-catching retail style',
      palette: 'Hot red, electric yellow, stark black, white — maximum urgency and attention-grabbing',
      brandContext: 'Flash sale, limited-time offer, or clearance event — visual should create FOMO and immediate action',
      emotions: 'Urgency, excitement, thrill of a deal, scarcity, impulse',
      composition: 'Central explosion/burst motif with price tags radiating outward, bold diagonal lines creating movement. Space at bottom for CTA button. 1:1, 4:5, and 16:9 versions, 4K.'
    },
    seasonal: {
      subject: 'A festive celebration scene with cultural decorations (diyas, lights, gifts), happy families shopping online on devices, surrounded by seasonal elements and floating discount badges.',
      style: 'Rich, festive illustration with warm lighting, cultural authenticity, modern digital painting style',
      palette: 'Deep saffron, maroon, gold, emerald green, warm yellow glow — traditional yet modern',
      brandContext: 'Festival or seasonal campaign (Diwali, holiday season) — visual should capture celebration spirit while driving commerce',
      emotions: 'Joy, celebration, togetherness, generosity, festive excitement',
      composition: 'Layered scene with celebrations in background and shopping/devices in foreground. Warm light sources from diyas/lamps. 16:9 and 9:16 story format, 4K, social media and email optimized.'
    },
    'general engagement': {
      subject: 'A modern smartphone displaying a vibrant CRM dashboard with happy customer avatars floating around it, connected by glowing network lines. Notification bells and heart icons pulse with energy.',
      style: 'Clean tech illustration, isometric 3D with flat color fills, SaaS marketing visual style',
      palette: 'Indigo, teal, soft white, light gray with accent coral — professional yet approachable',
      brandContext: 'General customer engagement or CRM campaign — visual should communicate smart, data-driven personalization',
      emotions: 'Connection, intelligence, care, modern efficiency, personalization',
      composition: 'Central device with orbiting customer elements, subtle grid background, clean whitespace for text overlay on top third. 16:9 landscape, 4K, website and presentation ready.'
    }
  };

  const narrative = narratives[objective];

  // Step 3 — Assemble the final production-ready prompt
  const imagePrompt = `${narrative.subject}\n\nVisual Style: ${narrative.style}.\nColor Palette: ${narrative.palette}.\nBrand Context: ${narrative.brandContext}.\nKey Emotions: ${narrative.emotions}.\nComposition & Quality: ${narrative.composition}\n\nAdditional instructions: No text or typography in the image. Ultra-high detail, professional marketing quality. Suitable for web banners, social media ads, and email headers.`;

  return JSON.stringify({
    type: 'image_prompt',
    objective: objectiveLabel,
    prompt: imagePrompt,
    details: {
      subject: narrative.subject,
      style: narrative.style,
      palette: narrative.palette,
      brandContext: narrative.brandContext,
      emotions: narrative.emotions,
      composition: narrative.composition
    }
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

4. For image/visual/banner/creative generation requests:
{
  "type": "image_prompt",
  "objective": "business objective label",
  "prompt": "a single, detailed, production-ready image generation prompt",
  "details": {
    "subject": "what the image depicts",
    "style": "visual style description",
    "palette": "color palette",
    "brandContext": "marketing context",
    "emotions": "target emotions",
    "composition": "layout, ratio, quality notes"
  }
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

// POST /api/ai/generate-image-prompt — dedicated image prompt generator
router.post('/generate-image-prompt', async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: 'Goal is required' });

    const systemPrompt = `You are an expert marketing creative director and AI image prompt engineer for a CRM platform.

The user will describe a business objective or campaign goal. You must:
1. Identify the business objective (e.g., user acquisition, churn reduction, retention, upselling, promotion, seasonal).
2. Infer the desired visual narrative and emotional tone.
3. Generate a detailed, production-ready image generation prompt.

Respond with valid JSON only:
{
  "type": "image_prompt",
  "objective": "business objective label",
  "prompt": "A single, detailed, production-ready image prompt string that can be used directly with GPT Image, Midjourney, Flux, or Stable Diffusion. Include subject, scene, style, palette, emotions, composition, and quality requirements.",
  "details": {
    "subject": "detailed subject and scene description",
    "style": "visual style (e.g., 3D render, flat illustration, photorealistic)",
    "palette": "specific color palette",
    "brandContext": "marketing context and brand tone",
    "emotions": "key emotions to evoke",
    "composition": "layout, aspect ratio, resolution, and quality notes"
  }
}

Optimize for modern AI image models. No text/typography in the image. Ultra-high detail, professional marketing quality.`;

    const aiResponse = await callLLM(systemPrompt, goal);

    let parsed;
    try {
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If LLM response is not parseable, use offline fallback
      const fallbackResult = generateImagePromptFallback(goal);
      parsed = JSON.parse(fallbackResult);
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
