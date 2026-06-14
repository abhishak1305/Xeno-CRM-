import { useState } from 'react';
import api from '../api/axios';
import { Sparkles, Send as SendIcon, Layers, MessageSquare, Lightbulb } from 'lucide-react';

const EXAMPLE_PROMPTS = [
  'Target customers who spent more than ₹5000 in the last 60 days',
  'Create a campaign to bring back inactive customers',
  'Find repeat buyers with more than 3 orders',
  'Draft a WhatsApp message for VIP customers',
  'Increase repeat purchases this month',
];

export default function AICopilot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/copilot', { prompt: text });
      const data = res.data;

      let aiContent = '';
      let actions = [];

      if (data.type === 'segment') {
        aiContent = `I've identified an audience for you: **${data.suggestedName || 'Custom Segment'}**\n\nHere are the segment rules I parsed:`;
        actions = [
          { type: 'segment', label: 'Create this segment', data: { name: data.suggestedName, rules: data.rules } }
        ];
      } else if (data.type === 'message') {
        aiContent = `Here's a draft message for your campaign:\n\n> ${data.draft}\n\nChannel: **${data.channel || 'WhatsApp'}**`;
      } else if (data.type === 'suggestion') {
        aiContent = data.content || 'Here\'s my recommendation:';
        if (data.suggestedSegment) {
          aiContent += `\n\n**Audience**: ${data.suggestedSegment.name}`;
          actions.push({ type: 'segment', label: 'Create segment', data: { name: data.suggestedSegment.name, rules: data.suggestedSegment.rules } });
        }
        if (data.suggestedMessage) {
          aiContent += `\n\n**Message**: ${data.suggestedMessage}`;
        }
        if (data.suggestedChannel) {
          aiContent += `\n**Channel**: ${data.suggestedChannel}`;
        }
      } else {
        aiContent = JSON.stringify(data, null, 2);
      }

      const aiMsg = { role: 'ai', content: aiContent, actions, rawData: data };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  };

  const handleAction = async (action) => {
    if (action.type === 'segment') {
      try {
        await api.post('/segments', {
          name: action.data.name || 'AI-Generated Segment',
          description: 'Created by AI Copilot',
          rules: action.data.rules
        });
        setMessages(prev => [...prev, { role: 'ai', content: `✅ Segment "${action.data.name}" created successfully! You can now use it in the Campaigns tab.` }]);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'ai', content: `❌ Failed to create segment: ${err.response?.data?.error || err.message}` }]);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          <Sparkles className="h-6 w-6 text-indigo-500" />
          AI Campaign Copilot
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Describe your marketing goal. AI will suggest audiences, messages, and channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl flex flex-col shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]" style={{ height: '600px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-4">
                  <Sparkles className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">What would you like to do?</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-md">
                  Describe your marketing goal in plain English. I can help you find the right audience, draft messages, and recommend channels.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {EXAMPLE_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(p)}
                      className="text-[11px] font-medium bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>

                  {/* Parsed rules display */}
                  {msg.rawData?.rules && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {Object.entries(msg.rawData.rules).filter(([, v]) => v != null && v !== '').map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-medium">
                          {k}: <span className="font-bold">{v}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  {msg.actions?.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {msg.actions.map((action, j) => (
                        <button
                          key={j}
                          onClick={() => handleAction(action)}
                          className="text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Layers className="h-3 w-3" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-4 bg-slate-50/50 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && sendMessage(input)}
                placeholder="Describe your campaign goal..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 px-5 py-3 rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Tips */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-fit">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 tracking-tight">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            What you can ask
          </h3>
          <div className="space-y-5 text-sm">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-500" /> Audience Discovery
              </h4>
              <p className="text-slate-500 leading-relaxed text-xs font-medium">
                "Find shoppers who haven't ordered in 90 days"<br />
                "Customers who spent more than ₹10,000"
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-pink-500" /> Message Drafting
              </h4>
              <p className="text-slate-500 leading-relaxed text-xs font-medium">
                "Draft a WhatsApp message for VIP customers"<br />
                "Write an email to bring back churned users"
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" /> Campaign Strategy
              </h4>
              <p className="text-slate-500 leading-relaxed text-xs font-medium">
                "Increase repeat purchases this month"<br />
                "Run a win-back campaign for lapsed shoppers"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
