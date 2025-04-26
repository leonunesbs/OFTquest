import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";

export default function TopicRanking() {
  const { data: topicRankings, isLoading } =
    api.playlist.getTopicRankings.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Temas</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!topicRankings) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Temas</CardTitle>
        <CardDescription>
          Distribuição de prevalência dos temas por ano e tipo de prova
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {topicRankings.map((yearData) => (
          <div key={yearData.year} className="space-y-6">
            <h3 className="text-xl font-semibold">{yearData.year}</h3>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Teórica 1</h4>
                <div className="space-y-2">
                  {(yearData.examTypes.teorica1 ?? []).map((topic) => (
                    <div
                      key={`${yearData.year}-teorica1-${topic.topic}`}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{topic.topic}</span>
                        <span className="text-sm text-muted-foreground">
                          {(topic.prevalence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={topic.prevalence * 100}
                        className="h-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">Teórica 2</h4>
                <div className="space-y-2">
                  {(yearData.examTypes.teorica2 ?? []).map((topic) => (
                    <div
                      key={`${yearData.year}-teorica2-${topic.topic}`}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{topic.topic}</span>
                        <span className="text-sm text-muted-foreground">
                          {(topic.prevalence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={topic.prevalence * 100}
                        className="h-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">Teórico Prática</h4>
                <div className="space-y-2">
                  {(yearData.examTypes.teoricoPratica ?? []).map((topic) => (
                    <div
                      key={`${yearData.year}-teoricoPratica-${topic.topic}`}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{topic.topic}</span>
                        <span className="text-sm text-muted-foreground">
                          {(topic.prevalence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={topic.prevalence * 100}
                        className="h-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
