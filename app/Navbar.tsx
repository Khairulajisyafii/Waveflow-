import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import Link from "next/link";

export default async function Navbar() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  let user = null;

  if (session) {
    try {
      const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
      const { payload } = await jwtVerify(session, secret);
      if (payload && payload.userId) {
        user = { name: payload.name || "User", email: payload.email };
      }
    } catch {
      // invalid session
    }
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link href={user ? "/dashboard" : "/"} style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-color)' }}>
          Waveflow
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link href="/dashboard" style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
              <Link href="/projects" style={{ color: 'var(--text-muted)' }}>Projects</Link>
              <span style={{ color: 'var(--text-color)', fontWeight: 500 }}>{user.email as string}</span>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">Login</Link>
              <Link href="/register" className="btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
