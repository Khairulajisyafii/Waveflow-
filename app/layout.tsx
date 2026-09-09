import "./globals.css";
import Navbar from "./Navbar";

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
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
