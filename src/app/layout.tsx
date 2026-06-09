import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CampaignForge — Plataforma de Rol Online",
    template: "%s | CampaignForge",
  },
  description:
    "La plataforma definitiva para campañas de rol. Crea, gestiona y narra aventuras épicas con IA integrada.",
  keywords: ["rol", "D&D", "RPG", "campaña", "dungeon master", "fichas de personaje", "generador IA"],
  authors: [{ name: "CampaignForge" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "CampaignForge",
    description: "La plataforma definitiva para campañas de rol",
    siteName: "CampaignForge",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[var(--bg-base)] text-[var(--text-primary)]">
        {children}
        <Toaster position="top-right" richColors />
        <ConfirmDialog />
      </body>
    </html>
  );
}
