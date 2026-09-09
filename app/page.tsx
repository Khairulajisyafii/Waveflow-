import Link from "next/link";

export default function Home() {
  return (
    <main className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Waveflow</h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Developer-focused collaborative task management.
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ maxWidth: '300px', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '1rem' }}>Collaborative Mode</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Work with your team in real-time. Share projects, assign tasks, and track progress.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/register" className="btn">Get Started</Link>
            <Link href="/login" className="btn btn-outline">Login</Link>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '300px', textAlign: 'left' }}>
          <h2 style={{ marginBottom: '1rem' }}>Personal Mode</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Offline-first task management for individual productivity. No account required.
          </p>
          <Link href="/personal" className="btn btn-outline" style={{ display: 'block', textAlign: 'center' }}>
            Open Personal Mode
          </Link>
        </div>
      </div>
    </main>
  );
}
