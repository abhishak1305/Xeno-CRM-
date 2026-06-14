import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, Search } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/customers').then(r => setCustomers(r.data)).catch(console.error);
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Users className="h-6 w-6 text-indigo-500" />
            Shoppers
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">{customers.length} customers in database</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-white border border-slate-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-72 transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Total Spend</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">{c.email}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">{c.phone}</td>
                  <td className="px-6 py-4 text-indigo-600 font-bold bg-indigo-50/30">₹{c.totalSpend?.toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{c.orderCount}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
