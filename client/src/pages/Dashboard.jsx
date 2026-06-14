import { useEffect, useState } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const load = () => {
      api.get('/stats').then(r => setStats(r.data)).catch(console.error);
      api.get('/campaigns').then(r => setCampaigns(r.data)).catch(console.error);
    };
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return <div className="text-slate-400 text-center py-20 font-medium">Loading dashboard...</div>;
  }

  // Data for Funnel Bar Chart
  const funnelData = [
    { name: 'Sent', value: stats.totalMessages, fill: '#0ea5e9' },
    { name: 'Delivered', value: stats.totalDelivered, fill: '#f472b6' },
    { name: 'Opened', value: stats.totalOpened, fill: '#fbbf24' },
    { name: 'Clicked', value: stats.totalClicked, fill: '#8b5cf6' },
    { name: 'Converted', value: stats.totalConverted, fill: '#10b981' },
  ];

  // Data for Donut Chart
  const pieData = [
    { name: 'Opened', value: stats.totalOpened || 0 },
    { name: 'Clicked', value: stats.totalClicked || 0 },
    { name: 'Converted', value: stats.totalConverted || 0 },
  ].filter(d => d.value > 0);

  const PIE_COLORS = ['#8b5cf6', '#0ea5e9', '#10b981'];

  // Simulated Trend Data for Line Chart (Since we don't have time-series in backend)
  const trendData = [
    { name: '2021', value: Math.floor(stats.totalConverted * 0.4) },
    { name: '2022', value: Math.floor(stats.totalConverted * 0.7) },
    { name: '2023', value: Math.floor(stats.totalConverted * 0.6) },
    { name: '2024', value: Math.floor(stats.totalConverted * 0.9) },
    { name: '2025', value: stats.totalConverted },
    { name: '2026', value: Math.floor(stats.totalConverted * 1.3) },
  ];

  const cards = [
    { label: 'Total Shoppers', value: stats.totalCustomers, badge: '+5.9%', badgeColor: 'text-emerald-600 bg-emerald-50', sparklineColor: '#10b981' },
    { label: 'Campaigns Sent', value: stats.totalCampaigns, badge: '+11.8%', badgeColor: 'text-blue-600 bg-blue-50', sparklineColor: '#0ea5e9' },
    { label: 'Messages Sent', value: stats.totalMessages, badge: '+14.4%', badgeColor: 'text-pink-600 bg-pink-50', sparklineColor: '#f472b6' },
    { label: 'Total Conversions', value: stats.totalConverted, badge: '+9.8%', badgeColor: 'text-orange-600 bg-orange-50', sparklineColor: '#f97316' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[28px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Report
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-400 flex items-center gap-2 shadow-sm w-64">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          Type anywhere to search
          <span className="ml-auto text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘F</span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-4">Overview</h3>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-600">{card.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{card.value.toLocaleString()}</span>
              {/* Dummy Sparkline */}
              <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 18C5 18 8 6 15 6C22 6 25 22 30 22C35 22 38 4 45 4C52 4 55 12 60 12" stroke={card.sparklineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Funnel (Matches 'Deals in Stage') */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-8">Delivery Funnel</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val}`} />
                <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projected Conversions (Matches 'Yearly Projected') */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Yearly Conversions</h3>
            <span className="text-slate-400 cursor-pointer">•••</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#f97316' }} activeDot={{ r: 6, fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Faked floating tooltip label for current value */}
          <div className="absolute top-[35%] right-[15%] bg-white px-3 py-1 rounded shadow-md border border-slate-100 text-xs font-bold text-slate-900 pointer-events-none">
            {stats.totalConverted.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Distribution (Donut) */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-2">Message Status</h3>
          <div className="h-[200px] flex items-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col justify-center gap-4 pl-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
                <div className="text-sm">
                  <p className="text-slate-500 font-medium">Open rate</p>
                  <p className="font-bold text-slate-800">{stats.totalMessages ? Math.round((stats.totalOpened / stats.totalMessages)*100) : 0}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div>
                <div className="text-sm">
                  <p className="text-slate-500 font-medium">Click rate</p>
                  <p className="font-bold text-slate-800">{stats.totalMessages ? Math.round((stats.totalClicked / stats.totalMessages)*100) : 0}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Campaigns (Replacing average leads/customer location to keep Xeno context) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Recent Campaigns</h3>
            <span className="text-slate-400 cursor-pointer">•••</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="pb-3 font-medium">Campaign Name</th>
                  <th className="pb-3 font-medium">Channel</th>
                  <th className="pb-3 font-medium">Delivered</th>
                  <th className="pb-3 font-medium">Converted</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {campaigns.slice(0, 4).map(c => (
                  <tr key={c._id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs font-medium">{c.channel}</span>
                    </td>
                    <td className="py-3 font-medium">{c.stats?.delivered || 0}</td>
                    <td className="py-3 font-medium">{c.stats?.converted || 0}</td>
                    <td className="py-3 text-right">
                      <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${
                        c.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                        c.status === 'running' ? 'bg-indigo-50 text-indigo-600' : 
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
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
