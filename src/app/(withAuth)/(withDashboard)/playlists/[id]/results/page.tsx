// src/app/playlists/[id]/results/page.tsx
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Progress } from "~/components/ui/progress";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";

export default async function PlaylistResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const playlist = await db.playlist.findUnique({
    where: { id: (await params).id, userId: session.user.id },
    include: {
      items: {
        include: {
          question: { include: { options: true, topics: true } },
        },
      },
    },
  });

  if (!playlist) redirect("/playlists");

  const items = playlist.items;
  const total = items.length;
  const answeredCount = items.filter(
    (item) => item.selectedOptionId !== null,
  ).length;
  const correctCount = items.filter((item) => {
    const sel = item.selectedOptionId;
    if (!sel) return false;
    const opt = item.question.options.find((o) => o.id === sel);
    return opt?.isCorrect;
  }).length;

  const accuracy = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;

  // Métricas por tema
  const metricsByTopic = items.reduce(
    (acc, item) => {
      const topics = item.question.topics.map((t) => t.name);
      const sel = item.selectedOptionId;
      const isCorrect = sel
        ? item.question.options.find((o) => o.id === sel)?.isCorrect
        : false;

      // Para cada tema, incrementa apenas uma vez
      for (const topic of topics) {
        if (!acc[topic]) acc[topic] = { answered: 0, correct: 0 };
        if (sel) {
          acc[topic].answered++;
          if (isCorrect) acc[topic].correct++;
        }
      }
      return acc;
    },
    {} as Record<string, { answered: number; correct: number }>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Resultados da Playlist</h1>
        <Button variant="outline" asChild>
          <Link href={`/playlists/${(await params).id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à Questões
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Desempenho Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {correctCount} de {total} questões corretas
                </div>
              </div>
              <Progress value={accuracy} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Temas Abordados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(metricsByTopic).map(([topic, m]) => {
                const pct = m.answered > 0 ? (m.correct / m.answered) * 100 : 0;
                return (
                  <div
                    key={topic}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{topic}</span>
                    <Badge
                      variant={
                        pct >= 70
                          ? "default"
                          : pct >= 50
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {pct.toFixed(1)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total de Questões</span>
                <Badge variant="outline">{total}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Acertos</span>
                <Badge variant="default">{correctCount}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Erros</span>
                <Badge variant="destructive">
                  {answeredCount - correctCount}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Questão</CardTitle>
          <CardDescription>
            Análise detalhada de cada questão respondida
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, idx) => {
            const sel = item.selectedOptionId;
            const opt = sel
              ? item.question.options.find((o) => o.id === sel)
              : null;
            const wasCorrect = opt?.isCorrect;
            return (
              <div key={item.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Questão {idx + 1}</Badge>
                      <Badge variant="secondary">{item.question.year}</Badge>
                      <Badge variant="secondary">{item.question.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        #{item.question.number}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tema:{" "}
                      {item.question.topics.map((t) => t.name).join(", ") ||
                        "Sem tema"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!sel ? (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Não respondida
                      </Badge>
                    ) : wasCorrect ? (
                      <Badge variant="default" className="gap-1">
                        <Check className="h-3 w-3" />
                        Correta
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Incorreta
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
