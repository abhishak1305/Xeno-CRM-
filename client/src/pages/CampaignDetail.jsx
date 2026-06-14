import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#ec4899', '#10b981'];
const STATUS_COLORS = {
  sent: 'bg-slate-100 text-slate-600',
  delivered: 'bg-indigo-50 text-indigo-600',
  failed: 'bg-rose-50 text-rose-600',
  opened: 'bg-amber-50 text-amber-600',
  read: 'bg-blue-50 text-blue-600',
  clicked: 'bg-pink-50 text-pink-600',
  converted: 'bg-emerald-50 text-emerald-600'
};

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const load = () => {
      api.get(`/campaigns/${id}`).then(r => setCampaign(r.data)).catch(console.error);
      api.get(`/campaigns/${id}/messages`).then(r => setMessages(r.data)).catch(console.error);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (!campaign) return <div className="text-slate-400 text-center py-20 font-medium">Loading...</div>;

  const s = campaign.stats || {};
  const chartData = [
    { name: 'Sent', value: s.sent || 0 },
    { name: 'Delivered', value: s.delivered || 0 },
    { name: 'Failed', value: s.failed || 0 },
    { name: 'Opened', value: s.opened || 0 },
    { name: 'Read', value: s.read || 0 },
    { name: 'Clicked', value: s.clicked || 0 },
    { name: 'Converted', value: s.converted || 0 },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/campaigns" className="text-slate-400 hover:text-slate-900 transition-colors p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <Send className="h-5 w-5 text-indigo-500" />
            {campaign.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {campaign.segmentId?.name || '—'} · {campaign.channel} · {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span className={`ml-auto text-[11px] font-bold px-3 py-1 rounded-full ${
          campaign.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
        }`}>
          {campaign.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <h3 className="text-base font-bold text-slate-800 mb-6">Delivery Lifecycle</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Message-level delivery log */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col h-[390px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Message Log</h3>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-bold">
              Live · {messages.length} messages
            </span>
          </div>
          <div className="overflow-x-auto flex-1 overflow-y-auto pr-2">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-slate-400 uppercase border-b border-slate-100 sticky top-0 bg-white z-10">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Recipient</th>
                  <th className="pb-3 pr-4 font-medium">Channel</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {messages.map(msg => (
                  <tr key={msg._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4 font-semibold text-slate-900">{msg.customerId?.name || '—'}</td>
                    <td className="py-3 pr-4 text-slate-500">{msg.recipient}</td>
                    <td className="py-3 pr-4 text-slate-600">{msg.channel}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[msg.status] || ''}`}>
                        {msg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
