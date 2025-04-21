// src/app/playlists/[id]/results/page.tsx
"use client";

import { AlertCircle, Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";

export default function PlaylistResultsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: playlist, isLoading } = api.playlist.getById.useQuery(
    { id },
    { enabled: !!id },
  );

  const items = playlist?.items;
  const total = items?.length;
  const correctCount = useMemo(
    () =>
      items?.filter((item) => {
        const sel = item.selectedOptionId;
        if (!sel) return false;
        const opt = item.question.options.find((o) => o.id === sel);
        return opt?.isCorrect;
      }).length,
    [items],
  );

  const accuracy = total! > 0 ? (correctCount! / total!) * 100 : 0;

  // Métricas por tema
  const metricsByTopic = useMemo(() => {
    return items?.reduce(
      (acc, item) => {
        const topic = item.question.topic;
        const sel = item.selectedOptionId;
        if (!acc[topic]) acc[topic] = { answered: 0, correct: 0 };
        if (sel) {
          acc[topic].answered++;
          const opt = item.question.options.find((o) => o.id === sel);
          if (opt?.isCorrect) acc[topic].correct++;
        }
        return acc;
      },
      {} as Record<string, { answered: number; correct: number }>,
    );
  }, [items]);

  // Loading state
  if (isLoading) {
    return <div className="container py-10">Carregando resultados...</div>;
  }
  return (
    <div className="container space-y-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Resultados da Playlist</CardTitle>
          <CardDescription>
            {correctCount} de {total} questões corretas ({accuracy.toFixed(1)}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={accuracy} className="h-4" />
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push(`/playlists/${id}`)}>
            Voltar à Questões
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métricas por Tema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(metricsByTopic!).map(([topic, m]) => {
            const pct = m.answered > 0 ? (m.correct / m.answered) * 100 : 0;
            return (
              <div key={topic} className="flex justify-between">
                <span>{topic}</span>
                <span>
                  {m.correct}/{m.answered} ({pct.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Questão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items?.map((item, idx) => {
            const sel = item.selectedOptionId;
            const opt = sel
              ? item.question.options.find((o) => o.id === sel)
              : null;
            const wasCorrect = opt?.isCorrect;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div>
                  <strong>Questão {idx + 1}:</strong> {item.question.year} -{" "}
                  {item.question.type} #{item.question.number}
                </div>
                <div className="flex items-center space-x-2">
                  {wasCorrect ? (
                    <Check className="text-green-600" />
                  ) : (
                    <AlertCircle className="text-red-600" />
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
