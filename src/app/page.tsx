import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Check } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  title: "OFTQuest - Questões Comentadas para Prova do CBO",
  description:
    "OFTQuest é a plataforma líder em questões comentadas para o CBO. Acesse gratuitamente questões do CBO com gabarito, sem necessidade de cadastro. Prepare-se para a prova do CBO com nossa plataforma especializada.",
  keywords: [
    "OFTQuest",
    "questões CBO",
    "prova de título oftalmologia",
    "questões comentadas CBO",
    "preparação CBO",
    "oftalmologia",
    "médico oftalmologista",
    "título de especialista",
    "questões gratuitas CBO",
    "playlists oftalmologia",
    "estudo oftalmologia",
    "plataforma oftalmologia",
    "preparação prova título",
    "questões comentadas oftalmologia",
  ],
  openGraph: {
    title:
      "OFTQuest - Questões Comentadas para Prova de Título em Oftalmologia",
    description:
      "OFTQuest é a plataforma líder em questões comentadas para o CBO. Acesse gratuitamente questões do CBO com gabarito, sem necessidade de cadastro. Prepare-se para a prova de título em oftalmologia com nossa plataforma especializada.",
    type: "website",
    locale: "pt_BR",
    siteName: "OFTQuest",
    images: [
      {
        url: "https://oftquest.vercel.app/oftquest-logo.png",
        width: 512,
        height: 512,
        alt: "Logo do OFTQuest - Plataforma de Estudos em Oftalmologia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "OFTQuest - Questões Comentadas para Prova de Título em Oftalmologia",
    description:
      "OFTQuest é a plataforma líder em questões comentadas para o CBO. Acesse gratuitamente questões do CBO com gabarito, sem necessidade de cadastro. Prepare-se para a prova de título em oftalmologia com nossa plataforma especializada.",
    images: ["https://oftquest.vercel.app/oftquest-logo.png"],
  },
};

export default async function Home() {
  const session = await auth();

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "OFTQuest",
    description:
      "OFTQuest é a plataforma líder em questões comentadas para o CBO (Conselho Brasileiro de Oftalmologia). Acesse questões detalhadamente explicadas, acompanhe seu progresso e melhore seu desempenho.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: [
      {
        "@type": "Offer",
        name: "Plano Gratuito",
        price: "0",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        description:
          "Acesso a questões do CBO com gabarito, sem necessidade de cadastro",
      },
      {
        "@type": "Offer",
        name: "Plano Registrado",
        price: "0",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        description:
          "Recursos básicos com cadastro, incluindo salvamento de questões favoritas e acompanhamento básico",
      },
      {
        "@type": "Offer",
        name: "Plano Premium",
        price: "0",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
        description:
          "Recursos avançados incluindo playlists personalizadas, questões comentadas e métricas avançadas",
      },
    ],
    featureList: [
      "Questões do CBO com gabarito",
      "Playlists personalizadas",
      "Questões comentadas",
      "Método automatizado de estudo",
      "Acompanhamento de progresso",
      "Métricas avançadas de desempenho",
    ],
    educationalUse: "Exam Preparation",
    educationalLevel: "Professional",
    audience: {
      "@type": "MedicalAudience",
      medicalAudienceType: "Ophthalmologists",
    },
    brand: {
      "@type": "Brand",
      name: "OFTQuest",
      logo: "https://oftquest.vercel.app/oftquest-logo.png",
      slogan: "Sua plataforma de estudos em oftalmologia",
    },
  };

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {/* Hero Section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <Badge variant="secondary" className="mb-2">
              Novo
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="text-primary">OFT</span>Quest
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground">
              Acesse gratuitamente questões do CBO com gabarito. Prepare-se para
              os desafios com nossa plataforma especializada.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/questoes">Começar Agora</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/premium">Conhecer Premium</Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Questões Gratuitas</CardTitle>
                <CardDescription>Acesso imediato sem cadastro</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Questões do CBO com gabarito</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Acesso a todas as questões</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Filtros por categoria</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Sem necessidade de login</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/questoes">Acessar Questões</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Usuário Registrado</CardTitle>
                <CardDescription>Recursos básicos com cadastro</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Todos os recursos gratuitos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Salvar questões favoritas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Acompanhamento básico</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Histórico de respostas</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/api/auth/signin">Criar Conta</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex flex-col border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Premium</CardTitle>
                  <Badge variant="secondary">Recomendado</Badge>
                </div>
                <CardDescription>
                  Recursos avançados para estudo
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Todos os recursos anteriores</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Playlists personalizadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Questões comentadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Métricas avançadas</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant="default" className="w-full">
                  <Link href="/premium">Conhecer Premium</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-semibold">Comece a estudar agora</h2>
            <p className="max-w-[600px] text-muted-foreground">
              Acesse gratuitamente nosso banco de questões ou faça upgrade para
              aproveitar todos os recursos premium.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {session ? (
                <>
                  <Button asChild variant="default">
                    <Link href="/aluno">Área do Aluno</Link>
                  </Button>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Logado como {session.user?.name}
                    </p>
                    <Button asChild variant="outline">
                      <Link href="/api/auth/signout">Sair</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <Button asChild>
                  <Link href="/api/auth/signin">Entrar</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
