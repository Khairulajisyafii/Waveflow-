"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../ClientProviders";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useAppContext();
  const [user, setUser] = useState<{ id: number; name: string; email: string; avatarUrl: string | null }>({
    id: 0, name: "", email: "", avatarUrl: null
  });
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setName(data.user.name);
        setAvatarUrl(data.user.avatarUrl || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!name.trim()) {
      setProfileMessage({ type: "error", text: "Name cannot be empty" });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), avatarUrl: avatarUrl.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: "success", text: "Profile successfully updated!" });
        setUser(data.user);
        // Dispatch custom event and refresh server components
        router.refresh();
      } else {
        setProfileMessage({ type: "error", text: data.error || "Failed to update profile." });
      }
    } catch {
      setProfileMessage({ type: "error", text: "System error occurred." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "All password fields are required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password confirmation does not match" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMessage({ type: "success", text: "Password successfully updated!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to update password." });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "System error occurred." });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: "2rem" }}>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (!user.id) return null;

  return (
    <main className="container" style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "2rem" }}>{t('profile')} Settings</h1>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3>{t('accountInfo')}</h3>
        
        <form onSubmit={handleUpdateProfile} style={{ marginTop: "1.5rem" }}>
          
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="form-group" style={{ flexGrow: 1, marginBottom: 0 }}>
              <label>{t('profilePic')}</label>
              <input 
                type="text" 
                className="form-input" 
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)} 
                placeholder="https://..."
                disabled={savingProfile}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{t('profilePicHelp')}</p>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label>{t('email')}</label>
            <input type="text" className="form-input" value={user.email} disabled style={{ backgroundColor: "var(--bg-color)", cursor: "not-allowed", opacity: 0.7 }} />
          </div>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label>{t('name')}</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              disabled={savingProfile}
              required
            />
          </div>
          <button type="submit" className="btn" disabled={savingProfile}>
            {savingProfile ? t('saving') : t('save')}
          </button>
          {profileMessage && (
            <p style={{ fontSize: "0.875rem", color: profileMessage.type === "error" ? "var(--danger-color)" : "var(--success-color)", marginTop: "0.75rem" }}>
              {profileMessage.text}
            </p>
          )}
        </form>
      </div>

      <div className="card">
        <h3>{t('security')}</h3>

        <form onSubmit={handleUpdatePassword} style={{ marginTop: "1.5rem" }}>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label>{t('currentPassword')}</label>
            <input 
              type="password" 
              className="form-input" 
              value={currentPassword} 
              onChange={(e) => setCurrentPassword(e.target.value)} 
              disabled={savingPassword}
            />
          </div>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label>{t('newPassword')}</label>
            <input 
              type="password" 
              className="form-input" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              disabled={savingPassword}
            />
          </div>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label>{t('confirmPassword')}</label>
            <input 
              type="password" 
              className="form-input" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              disabled={savingPassword}
            />
          </div>
          <button type="submit" className="btn btn-outline" disabled={savingPassword}>
            {savingPassword ? t('saving') : t('changePassword')}
          </button>
          {passwordMessage && (
            <p style={{ fontSize: "0.875rem", color: passwordMessage.type === "error" ? "var(--danger-color)" : "var(--success-color)", marginTop: "0.75rem" }}>
              {passwordMessage.text}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
