import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Button } from "~/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PremiumPage() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-muted-foreground">OFT.</span>
          <span className="text-primary">quest</span>
          <span className="block text-2xl sm:text-3xl">Premium</span>
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Aproveite todos os recursos avançados para maximizar seus estudos
        </p>

        <div className="mb-12 rounded-lg border bg-card p-8 shadow-sm">
          <div className="mb-8 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-primary">R$ 24,90</span>
            <span className="text-lg text-muted-foreground">/mês</span>
          </div>
          <Button asChild size="lg" className="w-full max-w-xs">
            <Link href="/checkout">Começar agora</Link>
          </Button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recursos Inclusos</CardTitle>
              <CardDescription>
                Tudo que você precisa para estudar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Playlists Personalizadas</h3>
                    <p className="text-sm text-muted-foreground">
                      Crie playlists inteligentes baseadas no seu desempenho
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Questões Comentadas</h3>
                    <p className="text-sm text-muted-foreground">
                      Explicações detalhadas de cada questão
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Métricas Avançadas</h3>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe seu progresso com gráficos e estatísticas
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefícios</CardTitle>
              <CardDescription>Vantagens exclusivas</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Estudo Otimizado</h3>
                    <p className="text-sm text-muted-foreground">
                      Foque nos temas que mais precisam de atenção
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Suporte Prioritário</h3>
                    <p className="text-sm text-muted-foreground">
                      Atendimento exclusivo para membros premium
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Cancelamento Flexível</h3>
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
    </main>
  );
}
