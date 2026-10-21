'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Code2, 
  HardDrive, 
  Megaphone, 
  ShieldCheck, 
  Edit2, 
  Check, 
  X, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface WingReport {
  id?: string;
  wing: 'software' | 'hardware' | 'operations' | 'committee';
  title: string;
  progress: number;
  report: string;
  updated_at?: string;
}

const DEFAULT_REPORTS: WingReport[] = [
  {
    wing: 'software',
    title: 'Software Wing',
    progress: 45,
    report: 'WebSocket relay integration is complete. Starting dashboard UI.',
    updated_at: new Date().toISOString(),
  },
  {
    wing: 'hardware',
    title: 'Hardware Wing',
    progress: 70,
    report: 'PCB v1 etched and tested. Waiting on DHT22 sensors to arrive.',
    updated_at: new Date().toISOString(),
  },
  {
    wing: 'operations',
    title: 'Operations Wing',
    progress: 20,
    report: 'Resource staging and budget validation in progress.',
    updated_at: new Date().toISOString(),
  },
  {
    wing: 'committee',
    title: 'Committee Wing',
    progress: 60,
    report: 'Reviewing 3 new ideas from the triage queue. Next vote scheduled for Friday.',
    updated_at: new Date().toISOString(),
  },
];

const WING_ICONS = {
  software: Code2,
  hardware: HardDrive,
  operations: Megaphone,
  committee: ShieldCheck,
};

export function WingProgressTracker({ 
  isAdmin, 
  userRole 
}: { 
  isAdmin: boolean; 
  userRole?: string;
}) {
  const supabase = createClient();
  const [reports, setReports] = useState<WingReport[]>(DEFAULT_REPORTS);
  const [loading, setLoading] = useState(true);
  const [editingWing, setEditingWing] = useState<string | null>(null);
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editReportText, setEditReportText] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('wing_reports')
        .select('*')
        .order('wing', { ascending: true });

      if (error) {
        console.error('Wing reports fetch error:', error);
        setErrorMsg(error.message);
      } else if (data && data.length > 0) {
        setReports(data as WingReport[]);
      }
    } catch (err: any) {
      console.error('Catch error:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel('realtime_wing_reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wing_reports' },
        (payload) => {
          if (payload.new) {
            setReports((prev) =>
              prev.map((r) => (r.wing === (payload.new as WingReport).wing ? (payload.new as WingReport) : r))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchReports]);

  const startEditing = (report: WingReport) => {
    setEditingWing(report.wing);
    setEditProgress(report.progress);
    setEditReportText(report.report);
  };

  const cancelEditing = () => {
    setEditingWing(null);
    setEditProgress(0);
    setEditReportText('');
  };

  const saveReport = async (wing: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('wing_reports')
      .upsert(
        {
          wing,
          title: reports.find((r) => r.wing === wing)?.title || wing,
          progress: editProgress,
          report: editReportText.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'wing' }
      );

    if (error) {
      alert(`Failed to update report: ${error.message}`);
    } else {
      setReports((prev) =>
        prev.map((r) =>
          r.wing === wing ? { ...r, progress: editProgress, report: editReportText.trim(), updated_at: new Date().toISOString() } : r
        )
      );
      cancelEditing();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errorMsg && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Database Warning: {errorMsg} (Displaying fallback data)</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {reports.map((item) => {
          const Icon = WING_ICONS[item.wing] || Code2;
          const isEditing = editingWing === item.wing;
          const canEdit = isAdmin || userRole === item.wing;

          return (
            <div
              key={item.wing}
              className="bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-xl p-6 flex flex-col justify-between transition-all hover:border-[#dfe7e0]/20"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#e0231c]/10 text-[#e0231c] border border-[#e0231c]/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#dfe7e0] text-sm tracking-wide">{item.title}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-[#78837c]">Section Head Report</p>
                    </div>
                  </div>

                  {canEdit && !isEditing && (
                    <button
                      type="button"
                      onClick={() => startEditing(item)}
                      className="flex items-center gap-1 text-[11px] text-[#78837c] hover:text-[#dfe7e0] transition-colors p-1"
                      title="Edit Report"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Update</span>
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 my-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <label className="text-[10px] uppercase tracking-widest text-[#78837c]">Progress</label>
                        <span className="font-mono text-[#e0231c] font-medium">{editProgress}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={editProgress}
                        onChange={(e) => setEditProgress(Number(e.target.value))}
                        className="w-full accent-[#e0231c] bg-[#111722] cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#78837c] block mb-1">
                        Status Summary
                      </label>
                      <textarea
                        value={editReportText}
                        onChange={(e) => setEditReportText(e.target.value)}
                        rows={2}
                        className="w-full bg-[#05070a] border border-[#dfe7e0]/20 rounded p-2 text-xs text-[#dfe7e0] outline-none focus:border-[#e0231c] resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={saving}
                        className="px-3 py-1 text-xs text-[#78837c] hover:text-[#dfe7e0] flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveReport(item.wing)}
                        disabled={saving}
                        className="px-3 py-1 bg-[#e0231c] text-white rounded text-xs flex items-center gap-1 font-medium hover:bg-[#c01d17]"
                      >
                        {saving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5 my-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#78837c] text-[10px] tracking-wider uppercase">Sprint Progress</span>
                        <span className="font-mono text-xs font-medium text-[#dfe7e0]">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-[#111722] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#e0231c] h-1.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-[#aab4ad] italic mt-4 line-clamp-3 leading-relaxed">
                      "{item.report}"
                    </p>
                  </>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#dfe7e0]/5 flex justify-between items-center text-[9px] text-[#78837c]">
                <span>Last synced</span>
                <span>
                  {item.updated_at 
                    ? new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Just now'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
