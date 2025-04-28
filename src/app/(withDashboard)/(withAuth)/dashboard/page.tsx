import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import DashboardClient from "~/components/DashboardClient";
import { api } from "~/trpc/server";

export default async function DashboardPage() {
  const timeZone = "America/Sao_Paulo";
  const today = new Date();
  const todaySP = new Date(today.toLocaleString("en-US", { timeZone }));
  todaySP.setHours(0, 0, 0, 0);

  // Get last Sunday for week view
  const startDate = new Date(todaySP);
  const dayOfWeek = todaySP.getDay();
  startDate.setDate(todaySP.getDate() - dayOfWeek);

  const endDate = new Date(todaySP);
  endDate.setHours(23, 59, 59, 999);

  const topicMetrics = await api.playlist.getUserTopicMetrics({
    startDate,
    endDate,
  });

  const dailyMetrics = await api.playlist.getUserDailyMetrics({
    startDate,
    endDate,
  });

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seu Desempenho</CardTitle>
          <CardDescription>
            Veja suas métricas de acerto, prevalência de temas e atividade.
          </CardDescription>
        </CardHeader>
      </Card>

      <DashboardClient
        initialTopicMetrics={topicMetrics}
        initialDailyMetrics={dailyMetrics}
      />
    </div>
  );
}
