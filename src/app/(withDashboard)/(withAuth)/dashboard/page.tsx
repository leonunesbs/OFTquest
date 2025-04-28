import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { HydrateClient, api } from "~/trpc/server";

import DashboardClient from "~/components/DashboardClient";
import { Toaster } from "~/components/ui/toaster";

type Period = "week" | "month" | "last30days" | "year";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const period = ((await searchParams).period as Period) ?? "week";
  const metrics = await api.playlist.getMetrics({ period });
  const success = (await searchParams).success === "true";
  const sessionId = (await searchParams).session_id as string | undefined;

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
      <HydrateClient>
        <DashboardClient
          metrics={metrics}
          success={success && sessionId ? success : false}
        />
        <Toaster />
      </HydrateClient>
    </div>
  );
}
