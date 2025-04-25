import "~/styles/globals.css";

import { type Metadata } from "next";
import { Open_Sans } from "next/font/google";

import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { TRPCReactProvider } from "~/trpc/react";

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OFTquest - Plataforma de Estudos e Métricas em Oftalmologia",
  description:
    "OFTquest é a plataforma definitiva para estudos e métricas em oftalmologia. Acesse questões específicas, acompanhe seu progresso e melhore seu desempenho com ferramentas especializadas para residentes e profissionais de oftalmologia.",
  applicationName: "OFTquest - Estudos em Oftalmologia",
  generator: "Next.js",
  keywords: [
    "oftalmologia",
    "estudos médicos",
    "questões oftalmologia",
    "métricas médicas",
    "residência médica",
    "estudos para médicos",
    "questões de oftalmologia",
    "plataforma de estudos médicos",
    "preparação para prova de título",
  ],
  authors: [{ name: "Leonardo Nunes", url: "https://github.com/leonunesbs" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://oftquest.vercel.app",
    languages: { "pt-BR": "https://oftquest.vercel.app" },
  },
  openGraph: {
    title: "OFTquest - Plataforma de Estudos em Oftalmologia",
    description:
      "Transforme sua preparação em oftalmologia com o OFTquest. Acesse questões específicas, acompanhe métricas de desempenho e otimize seus estudos com nossa plataforma especializada para residentes e profissionais de oftalmologia.",
    url: "https://oftquest.vercel.app",
    siteName: "OFTquest",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://oftquest.vercel.app/oftquest-logo.png",
        width: 512,
        height: 512,
        alt: "Logo do OFTquest - Plataforma de Estudos em Oftalmologia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@leonunesbs",
    title: "OFTquest - Sua Plataforma de Estudos em Oftalmologia",
    description:
      "OFTquest oferece ferramentas especializadas para estudos em oftalmologia. Questões específicas, métricas de desempenho e recursos exclusivos para otimizar sua preparação. Comece agora!",
    images: ["https://oftquest.vercel.app/oftquest-logo.png"],
  },
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: "/favicon/favicon-96x96.png",
    apple: "/favicon/apple-touch-icon.png",
    shortcut: "/favicon/favicon.ico",
    other: [
      { rel: "icon", url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewports = {
  mobile: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" async /> */}
        {/* Favicons */}
        <link
          rel="icon"
          type="image/png"
          href="/favicon/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="iSEOFT" />
        <link rel="manifest" href="/favicon/site.webmanifest" />

        {/* Metadata */}
        <meta name="robots" content="index, follow" />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className={openSans.className}>
        <TRPCReactProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
