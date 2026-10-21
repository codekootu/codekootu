'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  ChevronDown, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  RefreshCw, 
  Edit3, 
  Check, 
  Plus, 
  Trash2 
} from 'lucide-react';

export function CurrentProjectWidget({ userRole }: { userRole: string }) {
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sprint Objective edit state
  const [isEditingDirective, setIsEditingDirective] = useState(false);
  const [directiveText, setDirectiveText] = useState('');

  // Task creation state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const isSuperAdmin = userRole === 'super_admin';

  // --- Close Dropdown When Clicking Outside ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditingDirective(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // --- Fetch Active Project, All Projects, and Tasks ---
  const fetchCurrentProject = useCallback(async () => {
    try {
      // Find the project flagged with is_current = true
      const { data: currentData, error: currentError } = await supabase
        .from('projects')
        .select('*')
        .eq('is_current', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (currentError) {
        console.error("SUPABASE ERROR:", currentError);
        setErrorMsg(currentError.message);
        return;
      }

      let activeProj = currentData;

      // Fallback: pick newest project if none is marked current
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
        setDirectiveText(activeProj.sprint_directive || '');

        // Fetch tasks for the current project
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', activeProj.id)
          .order('created_at', { ascending: true });

        if (!taskError && taskData) {
          setTasks(taskData);
        }
      } else {
        setErrorMsg("No projects found in database.");
      }

      // Fetch list of distinct projects for switcher
      const { data: listData } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (listData) {
        // Deduplicate in UI by name in case DB has duplicate test records
        const unique = Array.from(new Map(listData.map(item => [item.name, item])).values());
        setAllProjects(unique);
      }
    } catch (err: any) {
      console.error("CATCH ERROR:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCurrentProject();

    // Realtime listener on projects & tasks
    const channel = supabase
      .channel('realtime_current_project_widget')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchCurrentProject();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchCurrentProject();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCurrentProject]);

  // --- Switch Active Project ---
  async function handleSwitchProject(newProjectId: string) {
    if (!isSuperAdmin || updating) return;
    setUpdating(true);

    try {
      // 1. Clear previous current project
      await supabase.from('projects').update({ is_current: false }).neq('id', '00000000-0000-0000-0000-000000000000');

      // 2. Set new active project
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

  // --- Update Project Status ---
  async function handleStatusChange(newStatus: string) {
    if (!isSuperAdmin || !project || updating) return;
    setUpdating(true);

    try {
      const { error: projError } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id);

      if (projError) throw projError;

      // Sync with ideas tracker
      if (project.idea_id) {
        await supabase.from('ideas').update({ status: newStatus }).eq('id', project.idea_id);
      } else {
        await supabase.from('ideas').update({ status: newStatus }).ilike('title', `%${project.name}%`);
      }

      setProject((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  // --- Save Sprint Objective ---
  async function handleSaveSprintObjective() {
    if (!isSuperAdmin || !project || updating) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('projects')
        .update({ sprint_directive: directiveText })
        .eq('id', project.id);

      if (error) throw error;
      setProject((prev: any) => ({ ...prev, sprint_directive: directiveText }));
      setIsEditingDirective(false);
    } catch (err: any) {
      alert("Error saving sprint directive: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  // --- Add New Task ---
  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !project || updating) return;
    setUpdating(true);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: project.id,
          title: newTaskTitle.trim(),
          status: 'Todo',
        })
        .select()
        .single();

      if (error) throw error;
      if (data) setTasks((prev) => [...prev, data]);
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch (err: any) {
      alert("Error adding task: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  // --- Toggle Task Checkbox ---
  async function handleToggleTask(taskId: string, currentStatus: string) {
    const nextStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    await supabase.from('tasks').update({ status: nextStatus }).eq('id', taskId);
  }

  // --- Delete Task ---
  async function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await supabase.from('tasks').delete().eq('id', taskId);
  }

  if (loading) return <div className="text-xs text-[#78837c] animate-pulse">Loading build...</div>;

  if (errorMsg) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{errorMsg}</span>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Top Header Trigger Pill */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0e12] border border-[#e0231c]/30 hover:border-[#e0231c] rounded-full transition-all text-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#e0231c] animate-pulse" />
        <span className="text-[#78837c] hidden sm:inline">Current:</span>
        <strong className="font-medium text-white truncate max-w-[130px]">{project.name}</strong>
        <ChevronDown className={`w-3 h-3 text-[#78837c] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-10 right-0 w-84 bg-[#0a0e12] border border-[#dfe7e0]/10 rounded-lg shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 text-sm max-h-[85vh] overflow-y-auto">
          
          {/* Active Build Title & Status */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[9px] tracking-widest uppercase text-[#78837c] mb-0.5">Active Build</div>
              <h3 className="font-semibold text-white leading-tight text-sm">{project.name}</h3>
            </div>
            
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
          
          {/* Sprint Directive (Editable for Admin) */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[9px] tracking-widest uppercase text-[#78837c] mb-1">
              <span>Sprint Objective</span>
              {isSuperAdmin && !isEditingDirective && (
                <button 
                  onClick={() => setIsEditingDirective(true)} 
                  className="text-[#aab4ad] hover:text-white flex items-center gap-1 text-[9px] lowercase tracking-normal"
                >
                  <Edit3 className="w-2.5 h-2.5" /> edit
                </button>
              )}
            </div>

            {isEditingDirective ? (
              <div className="flex flex-col gap-1.5">
                <textarea
                  value={directiveText}
                  onChange={(e) => setDirectiveText(e.target.value)}
                  className="w-full bg-[#111722] text-xs text-white border border-[#dfe7e0]/20 rounded p-1.5 outline-none resize-none focus:border-[#e0231c]"
                  rows={2}
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => {
                      setIsEditingDirective(false);
                      setDirectiveText(project.sprint_directive || '');
                    }}
                    className="px-2 py-0.5 text-[10px] text-[#78837c] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSprintObjective}
                    disabled={updating}
                    className="px-2 py-0.5 text-[10px] bg-[#e0231c] text-white rounded flex items-center gap-1 font-medium"
                  >
                    <Check className="w-2.5 h-2.5" /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#aab4ad] leading-snug">
                {project.sprint_directive || "No directive set."}
              </p>
            )}
          </div>

          {/* Switch Current Project List */}
          {allProjects.length > 0 && (
            <div className="mb-4 pt-3 border-t border-[#dfe7e0]/10">
              <div className="flex items-center justify-between text-[9px] tracking-widest uppercase text-[#78837c] mb-1.5">
                <span>Switch Current Project</span>
                {updating && <RefreshCw className="w-3 h-3 animate-spin text-[#e0231c]" />}
              </div>
              <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                {allProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => handleSwitchProject(proj.id)}
                    disabled={updating || !isSuperAdmin}
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

          {/* Tasks Section with Add Task Capability */}
          <div className="pt-3 border-t border-[#dfe7e0]/10">
            <div className="flex items-center justify-between text-[9px] tracking-widest uppercase text-[#78837c] mb-1.5">
              <span>Tasks ({tasks.length})</span>
              {isSuperAdmin && !isAddingTask && (
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="text-[#aab4ad] hover:text-white flex items-center gap-0.5 text-[9px] lowercase tracking-normal"
                >
                  <Plus className="w-2.5 h-2.5" /> add
                </button>
              )}
            </div>

            {/* Inline Add Task Form */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  placeholder="Task directive..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 bg-[#111722] border border-[#dfe7e0]/20 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#e0231c]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={updating}
                  className="px-2 py-1 bg-[#e0231c] text-white rounded text-[10px] font-medium"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-1 text-[#78837c] hover:text-white text-xs"
                >
                  ✕
                </button>
              </form>
            )}

            {tasks.length === 0 ? (
              <p className="text-xs text-[#78837c] italic">No tasks yet.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <li 
                    key={task.id} 
                    className="flex items-center justify-between group text-xs text-[#dfe7e0] hover:bg-[#111722]/50 p-1 rounded"
                  >
                    <div 
                      onClick={() => handleToggleTask(task.id, task.status)}
                      className="flex items-start gap-1.5 flex-1 cursor-pointer select-none"
                    >
                      {task.status === 'Done' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-[#78837c] mt-0.5 flex-shrink-0 group-hover:text-white" />
                      )}
                      <span className={task.status === 'Done' ? 'line-through text-[#78837c]' : ''}>
                        {task.title}
                      </span>
                    </div>

                    {isSuperAdmin && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-[#78837c] hover:text-red-400 p-0.5 transition-opacity"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
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
