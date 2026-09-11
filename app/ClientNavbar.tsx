"use client";

import Link from "next/link";
import { useAppContext } from "./ClientProviders";

export default function ClientNavbar({ user }: { user: any }) {
  const { theme, toggleTheme, lang, setLang, t } = useAppContext();

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href={user ? "/dashboard" : "/"} style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-color)' }}>
          Waveflow
        </Link>
        <div className="nav-links" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <>
              <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>{t('dashboard')}</Link>
              <Link href="/projects" style={{ color: 'var(--text-muted)' }}>{t('projects')}</Link>
              <Link href="/profile" style={{ color: 'var(--text-muted)' }}>{t('profile')}</Link>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ color: 'var(--text-color)', fontWeight: 500 }}>{user.name}</span>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">{t('login')}</Link>
              <Link href="/register" className="btn">{t('register')}</Link>
            </>
          )}

          {/* Theme & Lang Controls */}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as "id" | "en")}
              style={{ padding: '0.25rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
            >
              <option value="id">ID</option>
              <option value="en">EN</option>
            </select>
            <button 
              onClick={toggleTheme} 
              style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
              title="Toggle Dark Mode"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
