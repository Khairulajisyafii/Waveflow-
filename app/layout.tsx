import "./globals.css";
import Navbar from "./Navbar";
import { ClientProviders } from "./ClientProviders";

export const metadata = {
  title: "Waveflow",
  description: "Task Management for Developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <ClientProviders>
          <Navbar />
          {children}
          <footer style={{ marginTop: 'auto', paddingTop: '3rem', paddingBottom: '2rem' }}>
            <div className="container" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '600', letterSpacing: '0.5px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--primary-color)' }}>wave(</span>
                <span style={{ fontStyle: 'italic', opacity: 0.9 }}>Khairul Aji Syafi&apos;i</span>
                <span style={{ color: 'var(--primary-color)' }}>)</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href="https://github.com/Khairulajisyafii" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>GitHub: Khairulajisyafii (kerulsukee)</a>
                <a href="https://www.instagram.com/kkkrulll/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>Instagram: @kkkrulll</a>
                <span>Email: skhairulaji@gmail.com</span>
              </div>
            </div>
          </footer>
        </ClientProviders>
      </body>
    </html>
  );
}
