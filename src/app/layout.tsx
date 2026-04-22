import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feline",
  description: "Feline met login, chats, instellingen en lokale Ollama-ondersteuning.",
  icons: {
    icon: "/intro-assets/feline%20kalebassen.ico",
    shortcut: "/intro-assets/feline%20kalebassen.ico",
    apple: "/intro-assets/feline%20kalebassen.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="h-full antialiased">
      <body className="min-h-full font-body">{children}</body>
    </html>
  );
}
