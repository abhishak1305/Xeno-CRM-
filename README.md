# Xeno CRM — AI-Native Mini CRM for Shopper Engagement

An AI-native Mini CRM built for DTC/retail brands to segment shoppers, create personalized campaigns, and track communication performance across WhatsApp, SMS, Email, and RCS channels.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   React Client                   │
│   Dashboard · Shoppers · Segments · Campaigns   │
│              AI Campaign Copilot                │
└──────────────────┬──────────────────────────────┘
                   │ Axios (HTTP)
┌──────────────────▼──────────────────────────────┐
│              CRM Backend (Express)              │
│  Customers · Orders · Segments · Campaigns · AI │
│              MongoDB Atlas (Mongoose)           │
└──────────────────┬──────────────────────────────┘
                   │ HTTP (fire-and-forget)
┌──────────────────▼──────────────────────────────┐
│          Channel Simulator (Express)            │
│   Simulates: sent → delivered → opened →        │
│   read → clicked → converted                   │
│   Calls back CRM with status updates           │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| Layer    | Technology          |
|----------|---------------------|
| Frontend | React, React Router, Recharts, Tailwind CSS, Lucide Icons |
| Backend  | Node.js, Express    |
| Database | MongoDB Atlas, Mongoose |
| AI       | OpenRouter API (with local fallback) |

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (free tier works)

### 1. Clone and install dependencies

```bash
cd server && npm install
cd ../channel-service && npm install
cd ../client && npm install
```

### 2. Configure environment variables

**server/.env**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/xeno-crm
CHANNEL_SERVICE_URL=http://localhost:5001
OPENROUTER_API_KEY=your-key-here    # Optional — local fallback works without it
```

**channel-service/.env**
```
PORT=5001
CRM_CALLBACK_URL=http://localhost:5000/api/campaigns/callback
```

### 3. Seed the database

```bash
cd server && npm run seed
```

### 4. Run all three services

```bash
# Terminal 1: CRM Backend
cd server && npm run dev

# Terminal 2: Channel Simulator
cd channel-service && npm run dev

# Terminal 3: React Frontend
cd client && npm run dev
```

Open http://localhost:5173

## Features

### Data Ingestion
- Customers and orders stored in MongoDB
- Pre-seeded with 15 realistic Indian shopper profiles
- Bulk ingestion API available

### AI Segment Builder
- Natural language audience definition ("Customers who spent more than ₹5000 in the last 60 days")
- Manual rule builder with live matching count
- Rules: min/max spend, min orders, active/inactive days

### Campaign Creation
- Select segment → channel → AI-draft message → launch
- Supports WhatsApp, SMS, Email, RCS
- Personalization via `{{name}}` template variable

### Channel Simulation (Two-Service Architecture)
- CRM dispatches messages to Channel Simulator via HTTP
- Channel Simulator runs async lifecycle per message
- Callbacks sent back to CRM with status updates
- Lifecycle: sent → delivered/failed → opened → read → clicked → converted

### Campaign Analytics
- Real-time funnel visualization (Recharts)
- Per-campaign delivery log with live status updates
- Dashboard with aggregate metrics and pie charts

### AI Campaign Copilot
- Chat-first interface for describing marketing goals
- AI parses intent → suggests audience, message, channel
- One-click segment creation from AI suggestions
- Works with OpenRouter LLM or local rule-based fallback
