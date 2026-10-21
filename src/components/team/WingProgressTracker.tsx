'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Cpu, HardDrive, Megaphone, ShieldAlert, Edit2, X } from 'lucide-react';

const DEFAULT_WINGS = [
  { wing: 'software', progress_percentage: 0, report_text: 'No report provided yet.' },
  { wing: 'hardware', progress_percentage: 0, report_text: 'No report provided yet.' },
  { wing: 'operations', progress_percentage: 0, report_text: 'No report provided yet.' },
  { wing: 'committee', progress_percentage: 0, report_text: 'No report provided yet.' },
];

const WING_ICONS = {
  software: Cpu,
  hardware: HardDrive,
  operations: Megaphone,
  committee: ShieldAlert,
};

export function WingProgressTracker({ isAdmin }: { isAdmin: boolean }) {
  const supabase = createClient();
  const [reports, setReports] = useState<any[]>(DEFAULT_WINGS);
  const [editingWing, setEditingWing] = useState<string | null>(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchReports() {
      const { data } = await supabase.from('wing_reports').select('*').order('wing');
      
      if (data && data.length > 0) {
        // Merge fetched data with default wings to ensure all 4 show up
        const merged = DEFAULT_WINGS.map(def => {
          const fetched = data.find(d => d.wing === def.wing);
          return fetched ? fetched : def;
        });
        setReports(merged);
      }
      setLoaded(true);
    }
    fetchReports();
  }, [supabase]);

  const openEdit = (report: any) => {
    if (!isAdmin) return;
    setEditingWing(report.wing);
    setEditProgress(report.progress_percentage);
    setEditText(report.report_text);
  };

  const saveReport = async () => {
    if (!editingWing) return;
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    // Upsert logic: Insert if doesn't exist, update if it does
    const { error } = await supabase.from('wing_reports').upsert({
      wing: editingWing,
      progress_percentage: editProgress,
      report_text: editText,
      updated_by: session?.user.id,
      updated_at: new Date().toISOString()
    }, { onConflict: 'wing' });

    if (!error) {
      setReports(reports.map(r => r.wing === editingWing ? { ...r, progress_percentage: editProgress, report_text: editText } : r));
      setEditingWing(null);
    } else {
      alert("Error saving report: " + error.message);
    }
    setSaving(false);
  };

  if (!loaded) return <div className="text-[#78837c] py-10">Loading wing reports...</div>;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => {
          const Icon = WING_ICONS[report.wing as keyof typeof WING_ICONS] || ShieldAlert;
          return (
            <div key={report.wing} className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-xl p-6 relative group">
              
              {isAdmin && (
                <button onClick={() => openEdit(report)} className="absolute top-4 right-4 p-2 bg-[#05070a] border border-[#dfe7e0]/10 rounded-lg text-[#78837c] hover:text-[#e0231c] opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-[#05070a] border border-[#dfe7e0]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#e0231c]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white capitalize">{report.wing} Wing</h3>
                  <p className="text-xs text-[#78837c]">Section Head Report</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#aab4ad]">Sprint Progress</span>
                  <span className="text-white font-medium">{report.progress_percentage}%</span>
                </div>
                <div className="w-full h-2 bg-[#05070a] rounded-full overflow-hidden border border-[#dfe7e0]/5">
                  <div 
                    className="h-full bg-[#e0231c] rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${report.progress_percentage}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#05070a] border border-[#dfe7e0]/5 rounded-lg p-4 min-h-[80px]">
                <p className="text-sm text-[#dfe7e0] leading-relaxed italic">
                  "{report.report_text}"
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingWing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0a0e12] border border-[#dfe7e0]/20 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-[#dfe7e0]/10 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white capitalize">Update {editingWing} Report</h3>
              <button onClick={() => setEditingWing(null)} className="text-[#78837c] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs uppercase text-[#78837c] mb-2 block">Progress Percentage: {editProgress}%</label>
                <input 
                  type="range" min="0" max="100" value={editProgress} 
                  onChange={(e) => setEditProgress(parseInt(e.target.value))}
                  className="w-full accent-[#e0231c]" 
                />
              </div>
              <div>
                <label className="text-xs uppercase text-[#78837c] mb-2 block">Remarks / Status Update</label>
                <textarea 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="What is this wing currently working on?"
                  className="w-full h-32 bg-[#05070a] border border-[#dfe7e0]/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#e0231c] resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#dfe7e0]/10 flex justify-end gap-2 bg-[#05070a]">
              <button onClick={() => setEditingWing(null)} className="px-4 py-2 text-sm text-[#78837c] hover:text-white transition-colors">Cancel</button>
              <button onClick={saveReport} disabled={saving} className="px-6 py-2 bg-[#e0231c] hover:bg-[#c01d17] text-white text-sm font-medium rounded transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
