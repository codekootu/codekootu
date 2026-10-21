'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Check, X, Wallet, Receipt, ShieldCheck } from 'lucide-react';

export default function SpendingLog() {
  const supabase = createClient();
  const [logs, setLogs] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [newLog, setNewLog] = useState({
    event_name: '', amount: '', spent_where: '', spent_by: '', method: 'UPI', share_per_person: ''
  });

  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(prof);
    }

    const { data: mems } = await supabase.from('profiles').select('id, full_name').order('full_name');
    if (mems) setMembers(mems);

    const { data: logsData } = await supabase
      .from('spending_logs')
      .select(`
        *,
        spender:spent_by (full_name),
        creator:created_by (full_name)
      `)
      .order('created_at', { ascending: false });

    if (logsData) setLogs(logsData);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('spending_logs').insert({
      event_name: newLog.event_name,
      amount: parseFloat(newLog.amount),
      spent_where: newLog.spent_where,
      spent_by: newLog.spent_by,
      method: newLog.method,
      share_per_person: newLog.share_per_person ? parseFloat(newLog.share_per_person) : null,
      created_by: session.user.id
    });

    setIsAdding(false);
    setNewLog({ event_name: '', amount: '', spent_where: '', spent_by: '', method: 'UPI', share_per_person: '' });
    fetchData();
  };

  const handleApproval = async (id: string, status: 'Approved' | 'Rejected') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('spending_logs')
      .update({ status, approved_by: session.user.id })
      .eq('id', id);
      
    fetchData();
  };

  if (loading) return <div className="p-12 text-[#78837c]">Loading expenses...</div>;

  // Updated Role Logic based on your enum
  const teamRoles = ['super_admin', 'committee', 'software', 'hardware', 'operations'];
  const adminRoles = ['super_admin', 'committee'];
  
  const canAdd = teamRoles.includes(profile?.role);
  const canApprove = adminRoles.includes(profile?.role);
  
  const totalApproved = logs.filter(l => l.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-7xl mx-auto p-8 md:p-12 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-light mb-2 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-[#e0231c]" /> Spending Log
          </h1>
          <p className="text-[#78837c]">Track collective expenses, splits, and approvals.</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-[#78837c] mb-1">Total Approved</div>
            <div className="text-3xl font-medium text-white">₹{totalApproved.toFixed(2)}</div>
          </div>
          
          {canAdd && (
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-6 py-3 bg-[#e0231c] text-white rounded-full font-medium hover:bg-[#c01d17] transition-colors"
            >
              <Plus className="w-4 h-4" /> {isAdding ? 'Cancel' : 'Add Expense'}
            </button>
          )}
        </div>
      </div>

      {/* Add Expense Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-12 p-6 bg-[#0a0e12] border border-[#e0231c]/30 rounded-2xl animate-in slide-in-from-top-4">
          <h3 className="text-lg font-medium mb-4 text-white">Suggest New Expense</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input required placeholder="Event/Item Name" value={newLog.event_name} onChange={e => setNewLog({...newLog, event_name: e.target.value})} className="bg-[#05070a] border border-[#dfe7e0]/20 rounded-lg px-4 py-2 text-sm text-white focus:border-[#e0231c] outline-none" />
            <input required type="number" step="0.01" placeholder="Amount (₹)" value={newLog.amount} onChange={e => setNewLog({...newLog, amount: e.target.value})} className="bg-[#05070a] border border-[#dfe7e0]/20 rounded-lg px-4 py-2 text-sm text-white focus:border-[#e0231c] outline-none" />
            <input required placeholder="Spent Where (Store/Platform)" value={newLog.spent_where} onChange={e => setNewLog({...newLog, spent_where: e.target.value})} className="bg-[#05070a] border border-[#dfe7e0]/20 rounded-lg px-4 py-2 text-sm text-white focus:border-[#e0231c] outline-none" />
            
            <select required value={newLog.spent_by} onChange={e => setNewLog({...newLog, spent_by: e.target.value})} className="bg-[#05070a] border border-[#dfe7e0]/20 rounded-lg px-4 py-2 text-sm text-white focus:border-[#e0231c] outline-none">
              <option value="">Who Spent?</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
            
            <select required value={newLog.method} onChange={e => setNewLog({...newLog, method: e.target.value})} className="bg-[#05070a] border border-[#dfe7e0]/20 rounded-lg px-4 py-2 text-sm text-white focus:border-[#e0231c] outline-none">
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>

            <input type="number" step="0.01" placeholder="Share Per Person (₹) - Optional" value={newLog.share_per_person} onChange={e => setNewLog({...newLog, share_per_person: e.target.value})} className="bg-[#05070a] border border-[#dfe7e0]/20 rounded-lg px-4 py-2 text-sm text-white focus:border-[#e0231c] outline-none" />
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="px-6 py-2 bg-[#dfe7e0] text-black font-medium rounded-lg hover:bg-white transition-colors">Submit for Approval</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#dfe7e0]/10 bg-[#0a0e12]/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#dfe7e0]/10 text-xs uppercase tracking-widest text-[#78837c] bg-[#05070a]">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Event / Item</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Spent By / Where</th>
              <th className="p-4 font-medium">Method</th>
              <th className="p-4 font-medium">Split</th>
              <th className="p-4 font-medium">Status</th>
              {canApprove && <th className="p-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-[#dfe7e0]/5 hover:bg-[#0a0e12] transition-colors">
                <td className="p-4 text-sm text-[#78837c]">{new Date(log.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <div className="font-medium text-white">{log.event_name}</div>
                  <div className="text-xs text-[#78837c] mt-1 flex items-center gap-1"><Receipt className="w-3 h-3"/> {log.spent_where}</div>
                </td>
                <td className="p-4 font-medium text-[#e0231c]">₹{log.amount.toFixed(2)}</td>
                <td className="p-4 text-sm text-white">
                  {log.spender?.full_name}
                  <div className="text-[10px] text-[#78837c] uppercase tracking-wider mt-1">Suggested by {log.creator?.full_name}</div>
                </td>
                <td className="p-4 text-sm text-[#78837c]">{log.method}</td>
                <td className="p-4 text-sm text-[#78837c]">{log.share_per_person ? `₹${log.share_per_person}` : '—'}</td>
                <td className="p-4">
                  <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border ${
                    log.status === 'Approved' ? 'text-green-400 border-green-500/30 bg-green-500/10' :
                    log.status === 'Rejected' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                    'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 animate-pulse'
                  }`}>
                    {log.status}
                  </span>
                </td>
                {canApprove && (
                  <td className="p-4 text-right">
                    {log.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApproval(log.id, 'Approved')} className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"><Check className="w-4 h-4"/></button>
                        <button onClick={() => handleApproval(log.id, 'Rejected')} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-4 h-4"/></button>
                      </div>
                    )}
                    {log.status === 'Approved' && <ShieldCheck className="w-5 h-5 text-green-500/50 ml-auto" />}
                  </td>
                )}
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={canApprove ? 8 : 7} className="p-12 text-center text-[#78837c]">No expenses logged yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
