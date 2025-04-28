import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Check } from "lucide-react";
import Link from "next/link";
import { CheckoutButton } from "~/components/CheckoutButton";
import { Button } from "~/components/ui/button";

export default function PremiumPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-muted-foreground">OFT.</span>
              <span className="text-primary">quest</span>
              <span className="block text-2xl sm:text-3xl">Premium</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground">
              Aproveite todos os recursos avançados para maximizar seus estudos
            </p>
          </div>

          <div className="relative mb-12 overflow-hidden rounded-2xl border bg-card p-8 shadow-lg">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-primary/10" />

            <div className="relative">
              <div className="mb-8 flex items-baseline justify-center gap-1">
                <span className="text-6xl font-bold text-primary">
                  R$ 24,90
                </span>
                <span className="text-xl text-muted-foreground">/mês</span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <CheckoutButton />
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Link href="/questions">Testar novamente</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Recursos Inclusos</CardTitle>
                <CardDescription className="text-base">
                  Tudo que você precisa para estudar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Playlists Personalizadas
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Crie playlists inteligentes baseadas no seu desempenho
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Questões Comentadas
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Explicações detalhadas de cada questão
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Métricas Avançadas
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Acompanhe seu progresso com gráficos e estatísticas
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Benefícios</CardTitle>
                <CardDescription className="text-base">
                  Vantagens exclusivas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Estudo Otimizado
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Foque nos temas que mais precisam de atenção
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Suporte Prioritário
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Atendimento exclusivo para membros premium
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Cancelamento Flexível
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Cancele quando quiser, sem taxas
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
