"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KanbanBoard from "../../../components/KanbanBoard";
import Link from "next/link";

export default function ProjectDetails({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'board'|'integrations'|'members'>('board');
  const [repoInput, setRepoInput] = useState("");
  const [savingRepo, setSavingRepo] = useState(false);
  const [repoMessage, setRepoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Edit Project Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProjectAndMembers = async () => {
      try {
        const { id } = await paramsPromise;
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) {
          router.push("/projects");
          return;
        }
        const data = await res.json();
        setProject(data);
        setRepoInput(data.githubRepo || "");
        setEditName(data.name || "");
        setEditDesc(data.description || "");

        // Fetch Members
        const membersRes = await fetch(`/api/projects/${id}/members`);
        if (membersRes.ok) {
           const membersData = await membersRes.json();
           setMembers(membersData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectAndMembers();
  }, [paramsPromise, router]);

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

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
       const res = await fetch(`/api/projects/${project.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name: editName, description: editDesc })
       });
       if (res.ok) {
         const data = await res.json();
         setProject({...project, name: data.name, description: data.description});
         setIsEditModalOpen(false);
       } else {
         alert("Failed to update project");
       }
    } catch (err) {
       console.error(err);
    } finally {
       setSavingEdit(false);
    }
  };

  const handleInviteMember = async () => {
    const emailInput = document.getElementById('inviteEmailInput') as HTMLInputElement;
    if (!emailInput || !emailInput.value) return;
    const res = await fetch(`/api/projects/${project.id}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput.value })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Member added successfully!');
      // Refresh members list
      const membersRes = await fetch(`/api/projects/${project.id}/members`);
      if (membersRes.ok) {
        setMembers(await membersRes.json());
      }
      emailInput.value = '';
    } else {
      alert(data.error || 'Failed to add member');
    }
  };

  if (loading) {
    return <main className="container"><p>Loading project...</p></main>;
  }

  if (!project) return null;

  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <div className="page-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline" 
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit
          </button>
          <button 
            className="btn" 
            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', backgroundColor: 'var(--danger-color)' }}
            onClick={async () => {
              if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
                const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
                if (res.ok) router.push('/projects');
                else alert("Failed to delete project");
              }
            }}
          >
            Delete
          </button>
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
            borderBottom: activeTab === 'members' ? '2px solid var(--primary-color)' : '2px solid transparent',
            color: activeTab === 'members' ? 'var(--primary-color)' : 'var(--text-color)',
            fontWeight: activeTab === 'members' ? 500 : 400
          }}
          onClick={() => setActiveTab('members')}
        >
          Members
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
        {activeTab === 'members' && (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1rem' }}>Project Members</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              {members.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{m.name}</span>
                     <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{m.email}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: m.role === 'OWNER' ? 'var(--primary-color)' : 'var(--border-color)', color: m.role === 'OWNER' ? '#fff' : 'var(--text-color)', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>

            <h3 style={{ marginBottom: '1rem' }}>Invite Member</h3>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input 
                type="email" 
                className="form-input" 
                placeholder="user@example.com"
                id="inviteEmailInput"
                style={{ flexGrow: 1 }}
              />
              <button 
                className="btn btn-outline"
                onClick={handleInviteMember}
              >
                Invite
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Users must have a registered Waveflow account with the provided email address to be invited.
            </p>
          </div>
        )}
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
            
            <div className="card">
              <h3>Setup Instructions</h3>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                To track CI/CD status for this project, just paste this step at the bottom of your GitHub Actions workflow (<code>.github/workflows/ci.yml</code>):
              </p>
              <pre style={{ 
                backgroundColor: 'var(--bg-color)', 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                fontSize: '0.75rem', 
                overflowX: 'auto',
                marginTop: '1rem',
                border: '1px solid var(--border-color)'
              }}>
{`- name: Update CI Status to Waveflow
  if: always()
  run: |
    curl -X POST https://your-waveflow-domain.vercel.app/api/ci/webhook \\
      -H "Content-Type: application/json" \\
      -d '{
        "secret": "${project.webhookToken || 'YOUR_UNIQUE_WEBHOOK_TOKEN'}",
        "githubRepo": "\${{ github.repository }}",
        "ciStatus": "\${{ job.status }}"
      }'`}
              </pre>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>Note:</span> 
                <span>Replace <code>https://your-waveflow-domain.vercel.app</code> with your actual Vercel domain. This webhook token is unique to this project and requires no GitHub Secrets configuration!</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Edit Project</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <form onSubmit={handleEditProject}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea 
                  className="form-input" 
                  value={editDesc} 
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)} disabled={savingEdit}>Cancel</button>
                <button type="submit" className="btn" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
