// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KikeHQ · Centro de mando",
  description: "App",
  manifest: "/manifest.json",     // 👈 aquí integramos lo del manifest
  themeColor: "#0f172a",          // 👈 y el themeColor en el mismo objeto
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
