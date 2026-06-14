import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Layers, Sparkles, Save, Users } from 'lucide-react';

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDesc, setSegmentDesc] = useState('');
  const [rules, setRules] = useState({
    minSpend: '',
    maxSpend: '',
    minOrders: '',
    lastOrderDaysAgo: '',
    inactiveDays: ''
  });
  const [evalCount, setEvalCount] = useState(null);
  const [nlPrompt, setNlPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = () => {
    api.get('/segments').then(r => setSegments(r.data)).catch(console.error);
  };

  // Evaluate matching count when rules change
  const evaluate = async (r) => {
    try {
      const res = await api.post('/segments/evaluate', { rules: r });
      setEvalCount(res.data.count);
    } catch { setEvalCount(null); }
  };

  const handleRuleChange = (field, value) => {
    const updated = { ...rules, [field]: value };
    setRules(updated);
    evaluate(updated);
  };

  // AI segment parser
  const handleAIParse = async () => {
    if (!nlPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.post('/ai/copilot', { prompt: nlPrompt });
      const data = res.data;
      if (data.rules) {
        const newRules = {
          minSpend: data.rules.minSpend || '',
          maxSpend: data.rules.maxSpend || '',
          minOrders: data.rules.minOrders || '',
          lastOrderDaysAgo: data.rules.lastOrderDaysAgo || '',
          inactiveDays: data.rules.inactiveDays || ''
        };
        setRules(newRules);
        evaluate(newRules);
        if (data.suggestedName) setSegmentName(data.suggestedName);
      }
      if (data.suggestedSegment?.rules) {
        const newRules = {
          minSpend: data.suggestedSegment.rules.minSpend || '',
          maxSpend: data.suggestedSegment.rules.maxSpend || '',
          minOrders: data.suggestedSegment.rules.minOrders || '',
          lastOrderDaysAgo: data.suggestedSegment.rules.lastOrderDaysAgo || '',
          inactiveDays: data.suggestedSegment.rules.inactiveDays || ''
        };
        setRules(newRules);
        evaluate(newRules);
        if (data.suggestedSegment.name) setSegmentName(data.suggestedSegment.name);
      }
    } catch (err) {
      console.error(err);
    }
    setAiLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!segmentName) return;
    try {
      await api.post('/segments', { name: segmentName, description: segmentDesc, rules });
      setSegmentName('');
      setSegmentDesc('');
      setRules({ minSpend: '', maxSpend: '', minOrders: '', lastOrderDaysAgo: '', inactiveDays: '' });
      setEvalCount(null);
      setNlPrompt('');
      loadSegments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save segment');
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          <Layers className="h-6 w-6 text-indigo-500" />
          Audience Segments
        </h2>
        <p className="text-sm text-slate-500 mt-1">Define and save customer segments for campaigns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Builder */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 space-y-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          {/* AI Prompt */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-3">
            <label className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-4 w-4" /> Describe your audience in plain English
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder='e.g. "Customers who spent more than ₹5000 in the last 60 days"'
                value={nlPrompt}
                onChange={e => setNlPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAIParse()}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
              />
              <button
                type="button"
                onClick={handleAIParse}
                disabled={aiLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-5 py-2.5 rounded-lg text-sm text-white font-bold transition shadow-sm"
              >
                {aiLoading ? 'Parsing...' : 'AI Parse'}
              </button>
            </div>
          </div>

          {/* Manual Rules */}
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'minSpend', label: 'Min Spend (₹)', placeholder: '0' },
                { key: 'maxSpend', label: 'Max Spend (₹)', placeholder: 'Unlimited' },
                { key: 'minOrders', label: 'Min Orders', placeholder: '0' },
                { key: 'lastOrderDaysAgo', label: 'Active in last N days', placeholder: '30' },
                { key: 'inactiveDays', label: 'Inactive for N days', placeholder: '60' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
                  <input
                    type="number"
                    placeholder={placeholder}
                    value={rules[key]}
                    onChange={e => handleRuleChange(key, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Live Count */}
            {evalCount !== null && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" /> Matching Shoppers
                </span>
                <span className="text-2xl font-extrabold text-indigo-600">{evalCount}</span>
              </div>
            )}

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Segment Name</label>
                <input
                  type="text"
                  value={segmentName}
                  onChange={e => setSegmentName(e.target.value)}
                  placeholder="e.g. VIP Customers"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Description (optional)</label>
                <input
                  type="text"
                  value={segmentDesc}
                  onChange={e => setSegmentDesc(e.target.value)}
                  placeholder="Who this segment targets and why"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" /> Save Segment
            </button>
          </form>
        </div>

        {/* Saved Segments */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <h3 className="text-base font-bold text-slate-900 mb-4">Saved Segments</h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {segments.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No segments yet</p>
            ) : (
              segments.map(seg => (
                <div key={seg._id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900">{seg.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{seg.description || 'No description'}</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold border border-indigo-100">
                      {seg.customerCount} shoppers
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(seg.rules || {}).filter(([, v]) => v != null && v !== '').map(([k, v]) => (
                      <span key={k} className="text-[10px] bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium">
                        {k}: <span className="font-bold text-slate-900">{v}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
