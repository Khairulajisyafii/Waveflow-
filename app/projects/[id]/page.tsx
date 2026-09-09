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
  const [repoInput, setRepoInput] = useState("");
  const [savingRepo, setSavingRepo] = useState(false);
  const [repoMessage, setRepoMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
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
        setRepoInput(data.githubRepo || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [params.id, router]);

  const handleSaveRepo = async () => {
    setRepoMessage(null);
    const trimmedVal = repoInput.trim();
    
    if (!trimmedVal) {
      setRepoMessage({ type: 'error', text: 'Repository cannot be empty' });
      return;
    }
    
    if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(trimmedVal)) {
      setRepoMessage({ type: 'error', text: 'Format must be owner/repo' });
      return;
    }

    setSavingRepo(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubRepo: trimmedVal })
      });
      
      if (res.ok) {
        setProject({ ...project, githubRepo: trimmedVal });
        setRepoMessage({ type: 'success', text: 'Repository saved successfully!' });
      } else {
        setRepoMessage({ type: 'error', text: 'Failed to save repository.' });
      }
    } catch {
      setRepoMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSavingRepo(false);
    }
  };

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
                Link a repository to track its CI/CD status.
              </p>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="owner/repo" 
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  disabled={savingRepo}
                />
                <button 
                  className="btn btn-outline" 
                  onClick={handleSaveRepo}
                  disabled={savingRepo}
                >
                  {savingRepo ? 'Saving...' : 'Save'}
                </button>
              </div>
              
              {repoMessage && (
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: repoMessage.type === 'error' ? 'var(--danger-color)' : '#10b981',
                  marginTop: '0.5rem'
                }}>
                  {repoMessage.text}
                </p>
              )}
            </div>
            <div className="card">
              <h3>CI/CD Status</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                {(() => {
                  if (!project.ciStatus) {
                    return (
                      <>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}></span>
                        <span>CI/CD Not Connected</span>
                      </>
                    );
                  }

                  let color = 'var(--text-muted)';
                  if (project.ciStatus === 'SUCCESS') color = '#10b981';
                  else if (project.ciStatus === 'FAILED') color = 'var(--danger-color)';
                  else if (project.ciStatus === 'RUNNING') color = '#3b82f6';
                  else if (project.ciStatus === 'QUEUED') color = '#f59e0b';

                  return (
                    <>
                      <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }}></span>
                      <span style={{ fontWeight: 500 }}>{project.ciStatus}</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
