import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TaskFlow - Gestion de projets en équipe",
  description: "TaskFlow est un SaaS de gestion de projets en équipe. Organisez vos tâches, collaborez efficacement et suivez vos performances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
