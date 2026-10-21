'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronDown, CheckCircle2, Circle, AlertCircle, RefreshCw } from 'lucide-react';

export function CurrentProjectWidget({ userRole }: { userRole: string }) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSuperAdmin = userRole === 'super_admin';

  // 1. Fetch Current Project & Task List
  const fetchCurrentProject = useCallback(async () => {
    try {
      let query = supabase.from('projects').select('*');
      
      const { data: currentData, error: currentError } = await query
        .eq('is_current', true)
        .maybeSingle();

      if (currentError) {
        console.error("SUPABASE ERROR:", currentError);
        setErrorMsg(currentError.message);
        return;
      }

      let activeProj = currentData;

      // Fallback: if no project has is_current=true, pick the newest project
      if (!activeProj) {
        const { data: fallbackData } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        activeProj = fallbackData;
      }

      if (activeProj) {
        setProject(activeProj);

        // Fetch tasks for the current project
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', activeProj.id);

        if (!taskError && taskData) {
          setTasks(taskData);
        }
      } else {
        setErrorMsg("No projects found in database.");
      }

      // If Super Admin, fetch all projects so you can switch between them
      if (isSuperAdmin) {
        const { data: listData } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (listData) {
          setAllProjects(listData);
        }
      }
    } catch (err: any) {
      console.error("CATCH ERROR:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, isSuperAdmin]);

  useEffect(() => {
    fetchCurrentProject();

    // 2. Realtime subscription: updates for everyone when project or status changes
    const channel = supabase
      .channel('realtime_current_project')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          fetchCurrentProject();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCurrentProject]);

  // 3. Super Admin: Switch Current Project Globally
  async function handleSwitchProject(newProjectId: string) {
    if (!isSuperAdmin || updating) return;
    setUpdating(true);

    try {
      // Clear previous current project
      await supabase.from('projects').update({ is_current: false }).eq('is_current', true);

      // Set the new current project
      const { error } = await supabase
        .from('projects')
        .update({ is_current: true })
        .eq('id', newProjectId);

      if (error) {
        alert("Error setting current project: " + error.message);
      } else {
        await fetchCurrentProject();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  // 4. Super Admin: Update Status of Current Project and Sync with Ideas Table
  async function handleStatusChange(newStatus: string) {
    if (!isSuperAdmin || !project || updating) return;
    setUpdating(true);

    try {
      // 1. Update Project Status in the workbench projects table
      const { error: projError } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id);

      if (projError) throw projError;

      // 2. Sync status to parent ideas table so public tracker updates
      const targetIdeaId = project.idea_id;
      if (targetIdeaId) {
        await supabase
          .from('ideas')
          .update({ status: newStatus })
          .eq('id', targetIdeaId);
      } else {
        await supabase
          .from('ideas')
          .update({ status: newStatus })
          .ilike('title', `%${project.name}%`);
      }

      setProject((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err: any) {
      console.error("Status update error:", err);
      alert("Error updating status: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

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
        <div className="absolute top-10 right-0 w-80 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 text-sm max-h-[85vh] overflow-y-auto">
          {/* Active Build Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[9px] tracking-widest uppercase text-[#78837c] mb-0.5">Active Build</div>
              <h3 className="font-medium text-white leading-tight">{project.name}</h3>
            </div>
            
            {/* Status Dropdown matching exact Postgres idea_status enum */}
            {isSuperAdmin ? (
              <select
                value={project.status || 'Building'}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="text-[10px] bg-[#111722] text-[#e0231c] border border-[#e0231c]/40 rounded px-1.5 py-0.5 uppercase tracking-wider font-medium outline-none cursor-pointer"
              >
                <option value="Received">Received</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="Building">Building</option>
                <option value="QA">QA</option>
                <option value="Deployed">Deployed</option>
                <option value="Rejected">Rejected</option>
              </select>
            ) : (
              <span className="text-[9px] px-1.5 py-0.5 bg-[#e0231c]/20 text-[#e0231c] rounded uppercase tracking-wider font-medium">
                {project.status}
              </span>
            )}
          </div>
          
          {/* Sprint Directive */}
          <div className="mb-4">
            <div className="text-[9px] tracking-widest uppercase text-[#78837c] mb-1">Sprint Objective</div>
            <p className="text-xs text-[#aab4ad] leading-snug">
              {project.sprint_directive || "No directive set."}
            </p>
          </div>

          {/* Super Admin: Project Switcher */}
          {isSuperAdmin && allProjects.length > 0 && (
            <div className="mb-4 pt-3 border-t border-[#dfe7e0]/10">
              <div className="flex items-center justify-between text-[9px] tracking-widest uppercase text-[#78837c] mb-1.5">
                <span>Switch Current Project</span>
                {updating && <RefreshCw className="w-3 h-3 animate-spin text-[#e0231c]" />}
              </div>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                {allProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => handleSwitchProject(proj.id)}
                    disabled={updating}
                    className={`flex items-center justify-between px-2 py-1.5 rounded text-left text-xs transition-colors ${
                      proj.id === project.id
                        ? 'bg-[#e0231c]/10 text-white font-medium border border-[#e0231c]/30'
                        : 'text-[#aab4ad] hover:bg-[#111722] hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{proj.name}</span>
                    <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded bg-black/40 text-[#78837c]">
                      {proj.status || 'Building'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="pt-3 border-t border-[#dfe7e0]/10">
            <div className="text-[9px] tracking-widest uppercase text-[#78837c] mb-1">Tasks</div>
            {tasks.length === 0 ? (
              <p className="text-xs text-[#78837c] italic">No tasks yet.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                {tasks.map((task) => (
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
