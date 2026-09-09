"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { localDb } from "../../src/services/localDb";
import TaskDetailModal from "../../components/TaskDetailModal";

export default function PersonalModePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [addingTaskCol, setAddingTaskCol] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await localDb.getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateTask = async (e: React.FormEvent, status: string) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const newTask = await localDb.addTask(newTaskTitle, status, newTaskPriority);
      if (newTask) {
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
      await localDb.updateTaskStatus(taskId, newStatus);
    } catch (e) {
      console.error(e);
      setTasks(previousTasks); // Revert
    }
  };

  const updateTaskPriority = async (taskId: number, newPriority: string) => {
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));

    try {
      const instance = await import("../../src/services/localDb").then(m => m.getDb());
      if (instance) {
        const tx = instance.transaction('tasks', 'readwrite');
        const store = tx.objectStore('tasks');
        const task = await store.get(taskId);
        if (task) {
          task.priority = newPriority;
          await store.put(task);
        }
        await tx.done;
      }
    } catch (e) {
      console.error(e);
      setTasks(previousTasks); // Revert
    }
  };

  const handleUpdateTask = async (taskId: number, updates: any) => {
    // In local db, we need to update the object store
    await localDb.getTasks(); // Just checking it exists
    
    // Quick update local state
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));

    try {
      // Need an update function in localDb for full updates
      const instance = await import("../../src/services/localDb").then(m => m.getDb());
      if (instance) {
        const tx = instance.transaction('tasks', 'readwrite');
        const store = tx.objectStore('tasks');
        const task = await store.get(taskId);
        if (task) {
          Object.assign(task, updates);
          await store.put(task);
        }
        await tx.done;
      }
    } catch (e) {
      console.error(e);
      fetchTasks(); // Revert on error
      throw new Error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    try {
      const instance = await import("../../src/services/localDb").then(m => m.getDb());
      if (instance) {
        const tx = instance.transaction('tasks', 'readwrite');
        await tx.objectStore('tasks').delete(taskId);
        await tx.done;
      }
    } catch (e) {
      console.error(e);
      fetchTasks();
      throw new Error("Failed to delete task");
    }
  };

  if (loading) {
    return <main className="container"><p>Loading personal workspace...</p></main>;
  }

  const columns = ["TODO", "IN PROGRESS", "REVIEW", "DONE"];
  
  const filteredTasks = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !(t.description && t.description.toLowerCase().includes(search.toLowerCase()))) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
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
    <main className="container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontWeight: 500 }}>Personal Mode</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>My Workspace</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Offline-first task management. Data is saved to your browser.
          </p>
        </div>
      </div>

      <div style={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="form-input" 
            style={{ maxWidth: '300px' }}
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
        </div>

        <div style={{ display: 'flex', gap: '1rem', height: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
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
                          <button type="button" onClick={() => setAddingTaskCol(null)} style={{fontSize:'0.75rem', padding:'0.2rem 0.4rem', cursor:'pointer', background:'transparent', border:'none'}}>Cancel</button>
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
                        <div style={{ fontWeight: 500 }}>{task.title}</div>
                        <select 
                          value={task.priority}
                          onChange={(e) => updateTaskPriority(task.id, e.target.value)}
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
                              borderRadius: '0.25rem', cursor: 'pointer', whiteSpace: 'nowrap'
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
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </main>
  );
}
