import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Open_Sans } from "next/font/google";

import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/toaster";
import { TRPCReactProvider } from "~/trpc/react";

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "OFTquest - Questões Comentadas para o CBO",
    template: "%s | OFTquest",
  },
  description:
    "OFTquest é a plataforma especializada em questões comentadas para o CBO (Conselho Brasileiro de Oftalmologia). Acesse questões detalhadamente explicadas, acompanhe seu progresso e melhore seu desempenho com ferramentas específicas para a prova de título em oftalmologia.",
  applicationName: "OFTquest - Questões CBO",
  generator: "Next.js",
  keywords: [
    "CBO",
    "prova de título oftalmologia",
    "questões comentadas oftalmologia",
    "prova de título CBO",
    "questões CBO",
    "estudos para prova de título",
    "residência oftalmologia",
    "preparação CBO",
    "questões comentadas CBO",
    "oftalmologia",
    "médico oftalmologista",
    "título de especialista",
  ],
  authors: [{ name: "Leonardo Nunes", url: "https://github.com/leonunesbs" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://oftquest.vercel.app",
    languages: { "pt-BR": "https://oftquest.vercel.app" },
  },
  openGraph: {
    title: "OFTquest - Questões Comentadas para o CBO",
    description:
      "Prepare-se para a prova de título do CBO com o OFTquest. Acesse questões detalhadamente comentadas, acompanhe seu progresso e otimize seus estudos com nossa plataforma especializada para a prova de título em oftalmologia.",
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
    creator: "@leonunesbs",
    title: "OFTquest - Questões Comentadas para o CBO",
    description:
      "OFTquest oferece questões detalhadamente comentadas para a prova de título do CBO. Prepare-se com questões específicas, explicações detalhadas e recursos exclusivos para otimizar sua preparação. Comece agora!",
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
  verification: {
    google: "your-google-site-verification",
    yandex: "your-yandex-verification",
  },
  category: "education",
  classification: "educational",
  referrer: "origin-when-cross-origin",
};

export const viewports: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
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
        <meta name="apple-mobile-web-app-title" content="OFTQuest" />
        <link rel="manifest" href="/favicon/site.webmanifest" />

        {/* Metadata */}
        <meta name="robots" content="index, follow" />
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Schema.org Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "OFTQuest",
              url: "https://oftquest.vercel.app",
              logo: "https://oftquest.vercel.app/oftquest-logo.png",
              sameAs: [
                "https://github.com/leonunesbs",
                "https://twitter.com/leonunesbs",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "",
                contactType: "customer service",
                availableLanguage: ["Portuguese"],
              },
            }),
          }}
        />
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
