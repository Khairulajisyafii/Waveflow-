"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "id" | "en";

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const translations = {
  id: {
    dashboard: "Dasbor",
    projects: "Proyek",
    profile: "Profil",
    login: "Masuk",
    register: "Daftar",
    save: "Simpan",
    saving: "Menyimpan...",
    accountInfo: "Informasi Akun",
    security: "Keamanan",
    currentPassword: "Password Saat Ini",
    newPassword: "Password Baru",
    confirmPassword: "Konfirmasi Password Baru",
    changePassword: "Ubah Password",
    profilePic: "Foto Profil (URL)",
    profilePicHelp: "Masukkan link gambar untuk foto profil Anda.",
    name: "Nama",
    email: "Email"
  },
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    profile: "Profile",
    login: "Login",
    register: "Register",
    save: "Save",
    saving: "Saving...",
    accountInfo: "Account Information",
    security: "Security",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    changePassword: "Change Password",
    profilePic: "Profile Picture (URL)",
    profilePicHelp: "Enter an image link for your profile picture.",
    name: "Name",
    email: "Email"
  }
};

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLangState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const storedLang = localStorage.getItem("lang") as Language | null;

    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.setAttribute("data-theme", storedTheme);
    }
    if (storedLang) {
      setLangState(storedLang);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key: string) => {
    // @ts-expect-error: TS doesn't know about dynamic keys on translations object
    return translations[lang][key] || key;
  };

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, setLang, t }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within ClientProviders");
  }
  return context;
}
