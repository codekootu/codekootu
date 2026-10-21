'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export function CurrentProjectWidget({ userRole }: { userRole: string }) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        console.log("Widget: Fetching for role ->", userRole);

        // Simple query: just get the first project in the table
        let query = supabase.from('projects').select('*');

        if (userRole && userRole !== 'super_admin' && userRole !== 'public') {
          query = query.eq('assigned_wing', userRole);
        }

        const { data: projData, error: projError } = await query.limit(1).maybeSingle();

        if (projError) {
          console.error("SUPABASE ERROR:", projError);
          setErrorMsg(projError.message);
          return;
        }

        console.log("Widget: Project data ->", projData);

        if (projData) {
          setProject(projData);
          const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projData.id);
          
          if (taskError) {
            console.error("SUPABASE TASK ERROR:", taskError);
            setErrorMsg(taskError.message);
            return;
          }
          if (taskData) setTasks(taskData);
        } else {
          setErrorMsg("No project found in DB");
        }
      } catch (err: any) {
        console.error("CATCH ERROR:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [supabase, userRole]);

  if (loading) return <div className="text-xs text-[#78837c] animate-pulse">Loading build...</div>;

  if (errorMsg) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm max-w-md">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="whitespace-normal break-words">{errorMsg}</span>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0e12] border border-[#e0231c]/30 hover:border-[#e0231c] rounded-full transition-all text-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#e0231c] animate-pulse" />
        <span className="text-[#78837c] hidden sm:inline">Current:</span>
        <strong className="font-medium text-white truncate max-w-[120px]">{project.name}</strong>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-72 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 text-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[9px] tracking-widest uppercase text-[#78837c] mb-0.5">Active Build</div>
              <h3 className="font-medium text-white leading-tight">{project.name}</h3>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 bg-[#e0231c]/20 text-[#e0231c] rounded uppercase tracking-wider font-medium">{project.status}</span>
          </div>
          
          <div className="mb-4">
            <div className="text-[9px] tracking-widest uppercase text-[#78837c] mb-1">Sprint Objective</div>
            <p className="text-xs text-[#aab4ad] leading-snug">
              {project.sprint_directive || "No directive set."}
            </p>
          </div>

          <div>
            <div className="text-[9px] tracking-widest uppercase text-[#78837c] mb-1">Tasks</div>
            {tasks.length === 0 ? (
              <p className="text-xs text-[#78837c] italic">No tasks yet.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                {tasks.map(task => (
                  <li key={task.id} className="flex items-start gap-1.5 text-xs text-[#dfe7e0]">
                    {task.status === 'Done' ? (
                      <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-3 h-3 text-[#78837c] mt-0.5 flex-shrink-0" />
                    )}
                    <span className={task.status === 'Done' ? 'line-through text-[#78837c]' : ''}>{task.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
