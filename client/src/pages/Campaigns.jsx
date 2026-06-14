import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Send, Sparkles, Rocket, ArrowRight } from 'lucide-react';

export default function Campaigns() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  // Form state
  const [name, setName] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [channel, setChannel] = useState('WhatsApp');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    api.get('/segments').then(r => setSegments(r.data)).catch(console.error);
    loadCampaigns();
    const interval = setInterval(loadCampaigns, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadCampaigns = () => {
    api.get('/campaigns').then(r => setCampaigns(r.data)).catch(console.error);
  };

  const handleAIDraft = async () => {
    const segment = segments.find(s => s._id === segmentId);
    if (!segment) return alert('Select a segment first');
    setDraftLoading(true);
    try {
      const res = await api.post('/ai/draft-message', {
        segmentName: segment.name,
        channel,
        goal: `Write a ${channel} campaign message for ${segment.name} segment`
      });
      setMessageTemplate(res.data.draft || '');
    } catch (err) {
      console.error(err);
    }
    setDraftLoading(false);
  };

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!name || !segmentId || !messageTemplate) return alert('Fill all fields');
    setLaunching(true);
    try {
      const res = await api.post('/campaigns', { name, segmentId, channel, messageTemplate });
      setName('');
      setMessageTemplate('');
      loadCampaigns();
      alert(`Campaign "${res.data.name}" launched to ${res.data.recipientCount} shoppers!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to launch campaign');
    }
    setLaunching(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="h-6 w-6 text-indigo-500" />
            Campaign Hub
          </h2>
          <p className="text-sm text-slate-500 mt-1">Create, launch, and monitor campaigns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Creator */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <h3 className="font-bold text-slate-900 text-base">Create New Campaign</h3>
          <form onSubmit={handleLaunch} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Campaign Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Summer VIP Offer"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Target Segment</label>
              <select
                value={segmentId}
                onChange={e => setSegmentId(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="">Select segment...</option>
                {segments.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.customerCount} shoppers)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Channel</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option>WhatsApp</option>
                <option>SMS</option>
                <option>Email</option>
                <option>RCS</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Message Content</label>
                <button
                  type="button"
                  onClick={handleAIDraft}
                  disabled={draftLoading || !segmentId}
                  className="text-[10px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" /> {draftLoading ? 'Drafting...' : 'AI Auto-Draft'}
                </button>
              </div>
              <textarea
                value={messageTemplate}
                onChange={e => setMessageTemplate(e.target.value)}
                rows={4}
                required
                placeholder="Use {{name}} for personalization..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={launching}
              className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Rocket className="h-4 w-4" />
              {launching ? 'Launching...' : 'Launch Campaign'}
            </button>
          </form>
        </div>

        {/* Campaign List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <h3 className="font-bold text-slate-900 text-base mb-4">All Campaigns</h3>
          {campaigns.length === 0 ? (
            <div className="text-center py-20 text-slate-400">No campaigns yet. Launch one!</div>
          ) : (
            <div className="space-y-3">
              {campaigns.map(c => {
                const total = c.stats?.sent || 1;
                const delivered = c.stats?.delivered || 0;
                const progress = Math.round((delivered / total) * 100);

                return (
                  <div key={c._id} className="bg-[#f8f9fa] border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          c.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                          c.status === 'running' ? 'bg-indigo-100 text-indigo-700' : 
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {c.status.toUpperCase()}
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                          {c.channel}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Target: {c.segmentId?.name || 'Unknown'}</p>
                    </div>

                    <div className="flex-1 max-w-xs w-full">
                      <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-medium">
                        <span>Delivery Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <button 
                        onClick={() => navigate(`/campaigns/${c._id}`)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        View Report <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
