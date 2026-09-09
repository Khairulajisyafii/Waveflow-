"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import KanbanBoard from "../../../components/KanbanBoard";

export default function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("board");
  const router = useRouter();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (!res.ok) {
          router.push("/projects");
          return;
        }
        const data = await res.json();
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [params.id, router]);

  if (loading) {
    return <main className="container"><p>Loading project...</p></main>;
  }

  if (!project) return null;

  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Link href="/projects" style={{ color: 'var(--text-muted)' }}>Projects</Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ fontWeight: 500 }}>{project.name}</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{project.name}</h1>
          {project.description && (
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
              {project.description}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            borderBottom: activeTab === 'board' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: activeTab === 'board' ? 'var(--primary-color)' : 'var(--text-color)',
            fontWeight: activeTab === 'board' ? 500 : 400
          }}
          onClick={() => setActiveTab('board')}
        >
          Board
        </button>
        <button 
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer',
            borderBottom: activeTab === 'integrations' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: activeTab === 'integrations' ? 'var(--primary-color)' : 'var(--text-color)',
            fontWeight: activeTab === 'integrations' ? 500 : 400
          }}
          onClick={() => setActiveTab('integrations')}
        >
          Integrations
        </button>
      </div>

      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        {activeTab === 'board' && <KanbanBoard projectId={project.id} />}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-3">
            <div className="card">
              <h3>GitHub Integration</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                Not connected. Link a repository to view pull requests and issues.
              </p>
              <button className="btn btn-outline" disabled>Connect GitHub (Coming Soon)</button>
            </div>
            <div className="card">
              <h3>CI/CD Status</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}></span>
                <span>Not connected</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
