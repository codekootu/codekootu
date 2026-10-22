'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Wallet, ArrowLeft, Plus, X, MessageSquare, AlertTriangle, 
  CheckCircle2, Send, ShieldAlert, ChevronDown, ChevronUp 
} from 'lucide-react';

interface ExpenseComment {
  id: string;
  user_name: string;
  user_role: string;
  text: string;
  created_at: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  spent_where: string;
  spent_by: string;
  payment_method: string;
  share_per_person?: number | null;
  status: 'pending' | 'approved' | 'rejected' | 'disputed';
  created_at: string;
  dispute_note?: string | null;
  comments?: ExpenseComment[];
}

export default function SpendingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [spentWhere, setSpentWhere] = useState('');
  const [spentBy, setSpentBy] = useState('');
  const [method, setMethod] = useState('UPI');
  const [sharePerPerson, setSharePerPerson] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Disputing / Commenting states
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [disputeInput, setDisputeInput] = useState<{ [key: string]: string }>({});
  const [disputeMode, setDisputeMode] = useState<string | null>(null);

  // Auth & Profile Fetch
  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/team/login');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      setProfile(data || { full_name: 'Member', role: 'contributor' });
      setLoading(false);
    }
    init();
  }, [supabase, router]);

  // Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setExpenses(data as Expense[]);
    }
  }, [supabase]);

  useEffect(() => {
    fetchExpenses();

    const channel = supabase
      .channel('realtime_expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchExpenses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchExpenses]);

  // Role Permissions
  const userRole = profile?.role || '';
  const canAddExpense = [
    'super_admin',
    'software',
    'hardware',
    'operations',
    'committee'
  ].includes(userRole);

  const totalApproved = expenses
    .filter((e) => e.status === 'approved')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // Submit Expense (Leads & Super Admin only)
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddExpense) return;

    setSubmitting(true);
    const { error } = await supabase.from('expenses').insert({
      title: title.trim(),
      amount: parseFloat(amount),
      spent_where: spentWhere.trim(),
      spent_by: spentBy.trim() || profile?.full_name || 'Team Lead',
      payment_method: method,
      share_per_person: sharePerPerson ? parseFloat(sharePerPerson) : null,
      status: userRole === 'super_admin' ? 'approved' : 'pending',
      comments: [],
    });

    if (!error) {
      setTitle('');
      setAmount('');
      setSpentWhere('');
      setSpentBy('');
      setSharePerPerson('');
      setShowForm(false);
      fetchExpenses();
    } else {
      alert(`Error logging expense: ${error.message}`);
    }
    setSubmitting(false);
  };

  // Add Comment (Available to all team members)
  const handleAddComment = async (expense: Expense) => {
    if (!newComment.trim()) return;

    const commentPayload: ExpenseComment = {
      id: crypto.randomUUID(),
      user_name: profile?.full_name || 'Member',
      user_role: userRole,
      text: newComment.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedComments = [...(expense.comments || []), commentPayload];

    const { error } = await supabase
      .from('expenses')
      .update({ comments: updatedComments })
      .eq('id', expense.id);

    if (!error) {
      setNewComment('');
      fetchExpenses();
    }
  };

  // Submit Review Request / Dispute (Available to all team members)
  const handleRequestReview = async (expenseId: string) => {
    const reason = disputeInput[expenseId]?.trim();
    if (!reason) {
      alert('Please enter a note describing the error or question regarding this expense.');
      return;
    }

    const { error } = await supabase
      .from('expenses')
      .update({
        status: 'disputed',
        dispute_note: reason,
        disputed_by: profile?.id,
      })
      .eq('id', expenseId);

    if (!error) {
      setDisputeMode(null);
      setDisputeInput((prev) => ({ ...prev, [expenseId]: '' }));
      fetchExpenses();
    }
  };

  // Approve / Resolve (Super Admin or Wing Leads)
  const handleStatusChange = async (expenseId: string, nextStatus: 'approved' | 'rejected') => {
    if (!canAddExpense) return;
    await supabase.from('expenses').update({ status: nextStatus }).eq('id', expenseId);
    fetchExpenses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-[#dfe7e0]">
        Loading Ledger...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-[#dfe7e0] flex flex-col font-sans">
      {/* Top Bar */}
      <div className="border-b border-[#dfe7e0]/10 px-8 py-4 flex items-center justify-between">
        <Link 
          href="/team/dashboard" 
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78837c] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Workbench
        </Link>
        <span className="text-xs uppercase tracking-widest text-[#78837c]">
          {profile?.full_name} ({userRole.replace('_', ' ')})
        </span>
      </div>

      <div className="max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8 flex-1">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded bg-[#e0231c]/10 text-[#e0231c] border border-[#e0231c]/20">
                <Wallet className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-light text-white tracking-tight">Spending Log</h1>
            </div>
            <p className="text-xs text-[#78837c]">
              Track collective expenses, verify invoices, and flag errors.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-[#78837c] block">
                Total Approved
              </span>
              <span className="text-2xl font-mono font-medium text-white">
                ₹{totalApproved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* ONLY Team Leads and Super Admin get this button */}
            {canAddExpense && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2.5 bg-[#e0231c] hover:bg-[#c01d17] text-white rounded text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? 'Cancel' : 'Suggest Expense'}
              </button>
            )}
          </div>
        </div>

        {/* Suggest Expense Form (Only for Leads & Super Admin) */}
        {showForm && canAddExpense && (
          <form 
            onSubmit={handleAddExpense} 
            className="p-6 bg-[#0a0e12] border border-[#dfe7e0]/15 rounded-xl space-y-4 animate-in fade-in"
          >
            <h3 className="text-xs uppercase tracking-widest text-[#dfe7e0] font-medium">
              Suggest New Expense
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                required
                type="text"
                placeholder="Event/Item Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3.5 py-2.5 text-xs text-white placeholder-[#78837c] outline-none focus:border-[#e0231c]"
              />
              <input
                required
                type="number"
                step="0.01"
                placeholder="Amount (₹)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3.5 py-2.5 text-xs text-white placeholder-[#78837c] outline-none focus:border-[#e0231c]"
              />
              <input
                required
                type="text"
                placeholder="Spent Where (Store/Platform)"
                value={spentWhere}
                onChange={(e) => setSpentWhere(e.target.value)}
                className="bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3.5 py-2.5 text-xs text-white placeholder-[#78837c] outline-none focus:border-[#e0231c]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder={`Who Spent? (Default: ${profile?.full_name})`}
                value={spentBy}
                onChange={(e) => setSpentBy(e.target.value)}
                className="bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3.5 py-2.5 text-xs text-white placeholder-[#78837c] outline-none focus:border-[#e0231c]"
              />
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3.5 py-2.5 text-xs text-[#dfe7e0] outline-none focus:border-[#e0231c]"
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="NetBanking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Share Per Person (₹) - Optional"
                value={sharePerPerson}
                onChange={(e) => setSharePerPerson(e.target.value)}
                className="bg-[#05070a] border border-[#dfe7e0]/10 rounded px-3.5 py-2.5 text-xs text-white placeholder-[#78837c] outline-none focus:border-[#e0231c]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-white text-black font-medium rounded text-xs hover:bg-[#dfe7e0] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </form>
        )}

        {/* Expenses Table */}
        <div className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-6 py-3.5 border-b border-[#dfe7e0]/10 text-[10px] uppercase tracking-wider text-[#78837c]">
            <span className="col-span-2">Date</span>
            <span className="col-span-3">Event / Item</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-2">Spent By / Where</span>
            <span className="col-span-1">Method</span>
            <span className="col-span-2 text-right">Status / Actions</span>
          </div>

          <div className="divide-y divide-[#dfe7e0]/5">
            {expenses.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#78837c]">
                No expenses logged yet.
              </div>
            ) : (
              expenses.map((expense) => {
                const isExpanded = expandedExpenseId === expense.id;
                const isDisputing = disputeMode === expense.id;
                const commentCount = expense.comments?.length || 0;

                return (
                  <div key={expense.id} className="hover:bg-[#111722]/30 transition-colors">
                    {/* Main Row */}
                    <div className="grid grid-cols-12 gap-2 px-6 py-4 items-center text-xs">
                      <span className="col-span-2 text-[#78837c] font-mono">
                        {new Date(expense.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="col-span-3">
                        <span className="font-medium text-white block truncate">{expense.title}</span>
                        {expense.dispute_note && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Under Review
                          </span>
                        )}
                      </div>
                      <span className="col-span-2 font-mono font-medium text-white">
                        ₹{Number(expense.amount).toFixed(2)}
                      </span>
                      <div className="col-span-2 text-[#aab4ad] truncate">
                        <span className="block text-white truncate">{expense.spent_by}</span>
                        <span className="text-[10px] text-[#78837c] truncate block">{expense.spent_where}</span>
                      </div>
                      <span className="col-span-1 text-[#78837c] text-[11px] uppercase font-mono">
                        {expense.payment_method}
                      </span>

                      {/* Status & Options */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {expense.status === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Approved
                          </span>
                        )}
                        {expense.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                        {expense.status === 'disputed' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                            Review Flagged
                          </span>
                        )}

                        {/* Leads / Admin quick actions for pending/disputed */}
                        {canAddExpense && expense.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(expense.id, 'approved')}
                            className="p-1 hover:text-emerald-400 text-[#78837c]"
                            title="Approve Expense"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Accordion toggle for comments and dispute */}
                        <button
                          onClick={() => setExpandedExpenseId(isExpanded ? null : expense.id)}
                          className="p-1 text-[#78837c] hover:text-white flex items-center gap-1"
                          title="View Comments & Actions"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {commentCount > 0 && (
                            <span className="text-[10px] font-mono">{commentCount}</span>
                          )}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Drawer for Comments & Dispute */}
                    {isExpanded && (
                      <div className="px-6 py-4 bg-[#05070a]/80 border-t border-[#dfe7e0]/5 space-y-4">
                        {/* Dispute Warning Notice if active */}
                        {expense.dispute_note && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                              <ShieldAlert className="w-4 h-4" />
                              Review Request / Flagged Issue
                            </div>
                            <p className="text-[#dfe7e0] italic">"{expense.dispute_note}"</p>
                          </div>
                        )}

                        {/* Member Actions: Request Review Button */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-widest text-[#78837c]">
                            Discussion & Feedback
                          </span>

                          {!expense.dispute_note && (
                            <button
                              onClick={() => setDisputeMode(isDisputing ? null : expense.id)}
                              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {isDisputing ? 'Cancel Review Request' : 'Review Again (Report Error)'}
                            </button>
                          )}
                        </div>

                        {/* Review Flag Form */}
                        {isDisputing && (
                          <div className="p-3 bg-[#0a0e12] border border-amber-500/30 rounded-lg space-y-2">
                            <label className="text-[10px] text-[#78837c] uppercase tracking-wider block">
                              Reason for Review / Discrepancy Note:
                            </label>
                            <textarea
                              rows={2}
                              value={disputeInput[expense.id] || ''}
                              onChange={(e) =>
                                setDisputeInput({ ...disputeInput, [expense.id]: e.target.value })
                              }
                              placeholder="Describe the issue (e.g., incorrect split, duplicate transaction, wrong amount)..."
                              className="w-full bg-[#05070a] border border-[#dfe7e0]/15 rounded p-2 text-xs text-white outline-none focus:border-amber-400 resize-none"
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleRequestReview(expense.id)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-medium text-xs rounded transition-colors"
                              >
                                Submit Review Request
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {commentCount === 0 ? (
                            <div className="text-[11px] text-[#78837c] italic">No comments yet.</div>
                          ) : (
                            expense.comments?.map((c) => (
                              <div key={c.id} className="p-2.5 rounded bg-[#0a0e12] border border-[#dfe7e0]/5 text-xs">
                                <div className="flex justify-between items-center text-[10px] text-[#78837c] mb-1">
                                  <span className="text-[#dfe7e0] font-medium">
                                    {c.user_name}{' '}
                                    <span className="text-[#78837c] uppercase">({c.user_role})</span>
                                  </span>
                                  <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-[#aab4ad]">{c.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add a comment or question about this expense..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(expense)}
                            className="flex-1 bg-[#0a0e12] border border-[#dfe7e0]/15 rounded px-3 py-2 text-xs text-white placeholder-[#78837c] outline-none focus:border-[#e0231c]"
                          />
                          <button
                            onClick={() => handleAddComment(expense)}
                            className="px-3 py-2 bg-[#dfe7e0]/10 hover:bg-[#dfe7e0]/20 text-white rounded text-xs transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Comment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
