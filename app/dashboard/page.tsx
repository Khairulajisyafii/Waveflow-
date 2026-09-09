"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateProjectModal from "../../components/CreateProjectModal";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      const projRes = await fetch("/api/projects");
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
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

  return (
    <main className="container">
      <div className="page-header">
        <h1>Welcome, {user.name}</h1>
        <button className="btn" onClick={() => setIsModalOpen(true)}>Create Project</button>
      </div>

      <div className="grid grid-cols-3">
        <div style={{ gridColumn: 'span 2' }}>
          <h2 style={{ marginBottom: '1rem' }}>Your Projects</h2>
          {projects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <p>You don&apos;t have any projects yet.</p>
              <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setIsModalOpen(true)}>
                Create your first project
              </button>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {projects.map(project => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
                    <h3>{project.name}</h3>
                    {project.description && (
                      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        {project.description.length > 50 ? project.description.substring(0, 50) + '...' : project.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h2 style={{ marginBottom: '1rem' }}>Recent Activity</h2>
          <div className="card" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <p>No recent activity.</p>
          </div>
          
          <h2 style={{ margin: '2rem 0 1rem 0' }}>My Tasks</h2>
          <div className="card" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <p>No active tasks assigned to you.</p>
          </div>
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
