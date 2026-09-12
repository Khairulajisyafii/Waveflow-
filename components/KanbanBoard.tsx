"use client";

import { useEffect, useState } from "react";
import TaskDetailModal from "./TaskDetailModal";

export default function KanbanBoard({ projectId }: { projectId: number }) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [addingTaskCol, setAddingTaskCol] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  
  // Modal state
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const [tasksRes, membersRes] = await Promise.all([
        fetch(`/api/tasks?projectId=${projectId}`),
        fetch(`/api/projects/${projectId}/members`)
      ]);
      
      if (tasksRes.ok) {
        setTasks(await tasksRes.json());
      }
      if (membersRes.ok) {
        setMembers(await membersRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up polling for real-time updates (every 5 seconds)
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle, projectId, status, priority: newTaskPriority })
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks([...tasks, newTask]);
        setNewTaskTitle("");
        setNewTaskPriority("MEDIUM");
        setAddingTaskCol(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (e) {
      console.error(e);
      setTasks(previousTasks);
    }
  };

  const updateTaskPriority = async (taskId: number, newPriority: string) => {
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority })
      });
      if (!res.ok) throw new Error("Failed to update priority");
    } catch (e) {
      console.error(e);
      setTasks(previousTasks);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: any) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update task");
    }

    const updatedTask = await res.json();
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
  };

  const handleDeleteTask = async (taskId: number) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE"
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to delete task");
    }

    setTasks(tasks.filter(t => t.id !== taskId));
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading board...</div>;
  }

  const columns = ["TODO", "IN PROGRESS", "REVIEW", "DONE"];
  
  // Apply filters locally for snappiness (can also be done via API)
  const filteredTasks = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !(t.description && t.description.toLowerCase().includes(search.toLowerCase()))) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (assigneeFilter && t.assigneeId !== parseInt(assigneeFilter, 10)) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "URGENT": return "var(--danger-color)";
      case "HIGH": return "#f59e0b";
      case "MEDIUM": return "var(--primary-color)";
      case "LOW": return "var(--text-muted)";
      default: return "var(--text-muted)";
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filters Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search tasks..." 
          className="form-input" 
          style={{ maxWidth: '250px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="form-input" 
          style={{ maxWidth: '150px' }}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select 
          className="form-input" 
          style={{ maxWidth: '180px' }}
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="">All Assignees</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexGrow: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);
          
          return (
            <div key={col} style={{ 
              minWidth: '300px', width: '300px', backgroundColor: 'var(--border-color)', 
              borderRadius: '0.5rem', display: 'flex', flexDirection: 'column',
              maxHeight: '100%'
            }}>
              <div style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                <div>{col} <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.5rem' }}>{colTasks.length}</span></div>
                <button 
                  onClick={() => setAddingTaskCol(col)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  +
                </button>
              </div>
              <div style={{ padding: '0.5rem', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {addingTaskCol === col && (
                  <form onSubmit={(e) => handleCreateTask(e, col)} className="card" style={{ padding: '0.75rem' }}>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Task title..."
                      style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', marginBottom: '0.5rem' }}
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <select 
                        value={newTaskPriority}
                        onChange={e => setNewTaskPriority(e.target.value)}
                        style={{ fontSize: '0.75rem', padding: '0.1rem 0.2rem', border: '1px solid var(--border-color)', borderRadius: '0.25rem' }}
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="URGENT">URGENT</option>
                      </select>
                      <div style={{display:'flex', gap: '0.25rem'}}>
                        <button type="button" onClick={() => setAddingTaskCol(null)} style={{fontSize:'0.75rem', padding:'0.2rem 0.4rem', cursor:'pointer', background:'transparent', border:'none', color: 'var(--text-color)'}}>Cancel</button>
                        <button type="submit" style={{fontSize:'0.75rem', padding:'0.2rem 0.4rem', cursor:'pointer', background:'var(--primary-color)', color:'white', border:'none', borderRadius:'0.25rem'}}>Add</button>
                      </div>
                    </div>
                  </form>
                )}
                
                {colTasks.length === 0 && addingTaskCol !== col ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '1rem' }}>
                    No tasks
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div 
                      key={task.id} 
                      className="card" 
                      style={{ padding: '0.75rem', fontSize: '0.875rem' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 500, paddingRight: '0.5rem' }}>{task.title}</div>
                        <select 
                          value={task.priority}
                          onChange={(e) => { updateTaskPriority(task.id, e.target.value); }}
                          style={{ 
                            fontSize: '0.65rem', padding: '0.1rem 0.2rem', borderRadius: '1rem', 
                            color: 'white', backgroundColor: getPriorityColor(task.priority), 
                            flexShrink: 0, border: 'none', outline: 'none', cursor: 'pointer'
                          }}
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="URGENT">URGENT</option>
                        </select>
                      </div>
                      
                      {task.description && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.description}
                        </div>
                      )}
                      
                      {task.assigneeId && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                          👤 {members.find(m => m.id === task.assigneeId)?.name || 'Unknown'}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                        <button
                          onClick={() => setSelectedTask(task)}
                          style={{
                            fontSize: '0.65rem', padding: '0.25rem 0.5rem',
                            background: 'transparent', border: '1px solid var(--border-color)',
                            borderRadius: '0.25rem', cursor: 'pointer', color: 'var(--text-color)'
                          }}
                        >
                          ✏️ Edit Task
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                        {columns.filter(c => c !== col).map(c => (
                          <button
                            key={c}
                            onClick={() => updateTaskStatus(task.id, c)}
                            style={{ 
                              fontSize: '0.65rem', padding: '0.25rem 0.5rem', 
                              background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                              borderRadius: '0.25rem', cursor: 'pointer', whiteSpace: 'nowrap',
                              color: 'var(--text-color)'
                            }}
                          >
                            → {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}
