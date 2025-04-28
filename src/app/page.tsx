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
import { CheckoutButton } from "~/components/CheckoutButton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  keywords: [
    "OFT.quest",
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
};

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {/* Hero Section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <Badge variant="secondary" className="mb-2">
              Novo
            </Badge>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              <span className="text-muted-foreground">OFT</span>
              <span className="text-foreground">.quest</span>
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground">
              Acesse gratuitamente questões do CBO com gabarito. Prepare-se para
              os desafios com nossa plataforma especializada.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/questions">Começar Agora</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/premium">Premium</Link>
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
                  <Link href="/questions">Acessar Questões</Link>
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
                  Recursos avançados para sua preparação
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
                <CheckoutButton />
              </CardFooter>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-semibold">Comece a estudar agora</h2>
            <p className="max-w-[600px] text-muted-foreground">
              Acesse gratuitamente nosso banco de questões ou faça upgrade para
              aproveitar todos os recursos do Premium.
            </p>
            <div className="flex flex-col items-center gap-2">
              {session ? (
                <>
                  <Button asChild variant="default">
                    <Link href="/dashboard">Painel</Link>
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

        {/* Footer */}
        <footer className="w-full border-t bg-secondary py-4 text-center text-secondary-foreground">
          <div>
            <span className="text-muted-foreground">OFT</span>
            <span className="text-primary">.quest</span>
            <span className="ml-1 text-sm text-muted-foreground">
              © {new Date().getFullYear()} Todos os direitos reservados.
            </span>
          </div>
        </footer>
      </main>
    </HydrateClient>
  );
}
