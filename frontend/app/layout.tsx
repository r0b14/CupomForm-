// Shared document shell for the frontend.
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "./site-config";

const title = "CupomForm — Responda e ganhe seu cupom";
const description =
  "Responda algumas perguntas sobre trabalho e território e ganhe um cupom exclusivo para usar no comércio local, no projeto Gente Daqui.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s · CupomForm",
  },
  description,
  keywords: [
    "CupomForm",
    "Gente Daqui",
    "cupom de desconto",
    "comércio local",
    "formulário de campanha",
  ],
  applicationName: "CupomForm",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "CupomForm",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0a1f",
  colorScheme: "light",
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
