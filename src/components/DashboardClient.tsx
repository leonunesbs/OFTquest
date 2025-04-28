// src/app/(withAuth)/dashboard/DashboardClient.tsx
"use client";

import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import TopicRanking from "./TopicRanking";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

const dailyChartConfig = {
  count: {
    label: "Questões",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type TimeRange = "week" | "month" | "30days" | "year";

export default function DashboardClient() {
  // **1. Hooks no topo**
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const { data, isLoading } = api.playlist.getUserTopicMetrics.useQuery({
    period: timeRange,
  });
  const { data: dailyData } = api.playlist.getUserDailyMetrics.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  );

  // Debug logs

  const metrics = useMemo(() => {
    return data ?? [];
  }, [data]);

  // Add daily data processing
  const dailyChartData = useMemo(() => {
    if (!dailyData) return [];
    const timeZone = "America/Sao_Paulo";
    const today = new Date();
    const todaySP = new Date(today.toLocaleString("en-US", { timeZone }));
    todaySP.setHours(0, 0, 0, 0);

    let startDate: Date;
    switch (timeRange) {
      case "week":
        // Get the last Sunday
        startDate = new Date(todaySP);
        const dayOfWeek = todaySP.getDay();
        startDate.setDate(todaySP.getDate() - dayOfWeek);
        break;
      case "month":
        // First day of current month
        startDate = new Date(todaySP.getFullYear(), todaySP.getMonth(), 1);
        break;
      case "30days":
        // 30 days ago
        startDate = new Date(todaySP);
        startDate.setDate(todaySP.getDate() - 30);
        break;
      case "year":
        // First day of current year
        startDate = new Date(todaySP.getFullYear(), 0, 1);
        break;
    }

    return dailyData
      .filter((day) => {
        const date = new Date(day.date ?? new Date());
        const dateSP = new Date(date.toLocaleString("en-US", { timeZone }));
        dateSP.setHours(0, 0, 0, 0);
        return dateSP >= startDate;
      })
      .map((day) => {
        const date = new Date(day.date ?? new Date());
        return {
          date: date.toLocaleDateString("pt-BR", {
            weekday: "short",
            timeZone,
          }),
          count: day.count,
        };
      });
  }, [dailyData, timeRange]);

  const totals = useMemo(() => {
    if (!dailyData) return { today: 0, week: 0 };
    const timeZone = "America/Sao_Paulo";
    const today = new Date();
    const todaySP = new Date(today.toLocaleString("en-US", { timeZone }));
    todaySP.setHours(0, 0, 0, 0);

    let startDate: Date;
    switch (timeRange) {
      case "week":
        // Get the last Sunday
        startDate = new Date(todaySP);
        const dayOfWeek = todaySP.getDay();
        startDate.setDate(todaySP.getDate() - dayOfWeek);
        break;
      case "month":
        // First day of current month
        startDate = new Date(todaySP.getFullYear(), todaySP.getMonth(), 1);
        break;
      case "30days":
        // 30 days ago
        startDate = new Date(todaySP);
        startDate.setDate(todaySP.getDate() - 30);
        break;
      case "year":
        // First day of current year
        startDate = new Date(todaySP.getFullYear(), 0, 1);
        break;
    }

    // Find today's count in dailyData
    const todayCount =
      dailyData.find((day) => {
        const date = new Date(day.date ?? new Date());
        const dateSP = new Date(date.toLocaleString("en-US", { timeZone }));
        dateSP.setHours(0, 0, 0, 0);
        return dateSP.getTime() === todaySP.getTime();
      })?.count ?? 0;

    // Calculate total for the selected period
    const periodTotal = dailyData.reduce((sum, day) => {
      const date = new Date(day.date ?? new Date());
      const dateSP = new Date(date.toLocaleString("en-US", { timeZone }));
      dateSP.setHours(0, 0, 0, 0);
      return dateSP >= startDate ? sum + day.count : sum;
    }, 0);

    return { today: todayCount, week: periodTotal };
  }, [dailyData, timeRange]);

  // **3. Early returns (após hooks)**
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sem dados disponíveis</CardTitle>
          <CardDescription>
            Responda algumas questões para gerar suas métricas.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // **4. Renderização dos gráficos**
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            onClick={() => setTimeRange("week")}
          >
            Semana
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            onClick={() => setTimeRange("month")}
          >
            Mês
          </Button>
          <Button
            variant={timeRange === "30days" ? "default" : "outline"}
            onClick={() => setTimeRange("30days")}
          >
            30 Dias
          </Button>
          <Button
            variant={timeRange === "year" ? "default" : "outline"}
            onClick={() => setTimeRange("year")}
          >
            Ano
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Questões Hoje</CardTitle>
            <CardDescription>
              Total de questões respondidas hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.today}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {timeRange === "week"
                ? "Questões na Semana"
                : timeRange === "month"
                  ? "Questões no Mês"
                  : timeRange === "30days"
                    ? "Questões nos Últimos 30 Dias"
                    : "Questões no Ano"}
            </CardTitle>
            <CardDescription>
              {timeRange === "week"
                ? "Total de questões respondidas na última semana"
                : timeRange === "month"
                  ? "Total de questões respondidas no mês atual"
                  : timeRange === "30days"
                    ? "Total de questões respondidas nos últimos 30 dias"
                    : "Total de questões respondidas no ano atual"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totals.week}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questões por Dia</CardTitle>
          <CardDescription>
            {timeRange === "week"
              ? "Quantidade de questões respondidas nos últimos 7 dias"
              : timeRange === "month"
                ? "Quantidade de questões respondidas no mês atual"
                : timeRange === "30days"
                  ? "Quantidade de questões respondidas nos últimos 30 dias"
                  : "Quantidade de questões respondidas no ano atual"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dailyChartData.length > 0 ? (
            <ChartContainer config={dailyChartConfig}>
              <BarChart data={dailyChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={8} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">
                Nenhum dado disponível para exibição
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            {totals.today > 0 ? (
              <>
                {totals.today} questões hoje <TrendingUp className="h-4 w-4" />
              </>
            ) : (
              "Nenhuma questão respondida hoje"
            )}
          </div>
          <div className="leading-none text-muted-foreground">
            {timeRange === "week"
              ? "Mostrando o total de questões dos últimos 7 dias"
              : timeRange === "month"
                ? "Mostrando o total de questões do mês atual"
                : timeRange === "30days"
                  ? "Mostrando o total de questões dos últimos 30 dias"
                  : "Mostrando o total de questões do ano atual"}
          </div>
        </CardFooter>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <TopicRanking />
      </div>
    </div>
  );
}
