// Shared document shell for the frontend.
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CupomForm",
  description: "Responda e receba seu cupom exclusivo.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
