"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateProjectModal from "../../components/CreateProjectModal";
import { useAppContext } from "../ClientProviders";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { t } = useAppContext();

  const fetchData = async () => {
    try {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      const [projRes, tasksRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/tasks")
      ]);
      
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
      }
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setMyTasks(tasksData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProjectCreated = (newProject: any) => {
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
  };

  if (loading) {
    return <main className="container"><p>Loading dashboard...</p></main>;
  }

  if (!user) return null;

  const connectedProjects = projects.filter(p => p.githubRepo).length;
  const activeTasks = myTasks.filter(t => t.status !== "DONE").length;

  return (
    <main className="container" style={{ padding: "1.5rem" }}>
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>Welcome back, {user.name}</h1>
          <p style={{ color: "var(--text-muted)" }}>Here&apos;s what&apos;s happening with your projects today.</p>
        </div>
        <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => setIsModalOpen(true)}>
          <span style={{ fontSize: '1.25rem' }}>+</span> Create Project
        </button>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-3" style={{ marginBottom: "2rem", gap: "1.5rem" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "4px solid var(--primary-color)" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase" }}>Total Projects</span>
          <span style={{ fontSize: "2rem", fontWeight: "bold" }}>{projects.length}</span>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "4px solid #10b981" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase" }}>CI/CD Connected</span>
          <span style={{ fontSize: "2rem", fontWeight: "bold" }}>{connectedProjects}</span>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "4px solid #f59e0b" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase" }}>Pending Tasks</span>
          <span style={{ fontSize: "2rem", fontWeight: "bold" }}>{activeTasks}</span>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ gap: "2rem" }}>
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>{t('projects')}</h2>
            <Link href="/projects" style={{ fontSize: '0.875rem', fontWeight: 500 }}>View all &rarr;</Link>
          </div>
          
          {projects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
              <p style={{ marginBottom: '1rem' }}>You don&apos;t have any projects yet.</p>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(true)}>
                Create your first project
              </button>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {projects.slice(0, 4).map(project => (
                <Link href={`/projects/${project.id}`} key={project.id} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ cursor: 'pointer', height: '100%', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{project.name}</h3>
                      {project.githubRepo && (
                        <span title="GitHub Linked" style={{ fontSize: '1rem' }}>🐙</span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.4, margin: 0 }}>
                      {project.description ? (project.description.length > 60 ? project.description.substring(0, 60) + '...' : project.description) : 'No description provided.'}
                    </p>
                    {project.ciStatus && (
                       <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: project.ciStatus === 'SUCCESS' ? '#10b981' : project.ciStatus === 'FAILED' ? 'var(--danger-color)' : '#3b82f6' }}></span>
                          <span style={{ color: 'var(--text-muted)' }}>CI/CD: {project.ciStatus}</span>
                       </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h2 style={{ marginBottom: '1rem' }}>My Tasks</h2>
          {myTasks.length === 0 ? (
            <div className="card" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 1rem' }}>
              <p>No active tasks assigned to you.</p>
              <span style={{ fontSize: '2rem', display: 'block', marginTop: '0.5rem' }}>☕</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myTasks.slice(0, 5).map(task => (
                <Link href={`/projects/${task.projectId}`} key={task.id} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '1rem', borderLeft: task.status === 'DONE' ? '4px solid #10b981' : task.status === 'IN_PROGRESS' ? '4px solid #3b82f6' : '4px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-color)' }}>{task.title}</h4>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', backgroundColor: 'var(--bg-color)', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {myTasks.length > 5 && (
                 <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                   <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>+ {myTasks.length - 5} more tasks</span>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleProjectCreated} 
        />
      )}
    </main>
  );
}
