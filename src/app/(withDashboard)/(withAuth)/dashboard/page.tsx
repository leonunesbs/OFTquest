import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import DashboardClient from "~/components/DashboardClient";
import { api } from "~/trpc/server";

type Period = "week" | "month" | "last30days" | "year";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const period = ((await searchParams).period as Period) ?? "week";
  const metrics = await api.playlist.getMetrics({ period });

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

      <DashboardClient metrics={metrics} />
    </div>
  );
}
