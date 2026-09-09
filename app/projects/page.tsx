"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateProjectModal from "../../components/CreateProjectModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProjectCreated = (newProject: any) => {
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
  };

  if (loading) {
    return <main className="container"><p>Loading projects...</p></main>;
  }

  return (
    <main className="container">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn" onClick={() => setIsModalOpen(true)}>Create Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
          <p>You don&apos;t have any projects yet.</p>
          <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setIsModalOpen(true)}>
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {projects.map(project => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <div className="card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{project.name}</h3>
                {project.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', flexGrow: 1 }}>
                    {project.description}
                  </p>
                )}
                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleProjectCreated} 
        />
      )}
    </main>
  );
}
