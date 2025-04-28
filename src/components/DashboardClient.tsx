"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "~/hooks/use-toast";
import { Button } from "./ui/button";

type Period = "week" | "month" | "last30days" | "year";

interface MetricsData {
  totalAnswered: number;
  totalAccuracy: number;
  periodAnswered: number;
  periodAccuracy: number;
  questionsByPeriod: Array<{ period: string; count: number }>;
  accuracyByPeriod: Array<{ period: string; accuracy: number }>;
}

interface DashboardClientProps {
  metrics: MetricsData;
  success?: boolean;
}

const periodOptions: { value: Period; label: string }[] = [
  { value: "week", label: "Esta Semana" },
  { value: "month", label: "Este Mês" },
  { value: "last30days", label: "Últimos 30 Dias" },
  { value: "year", label: "Este Ano" },
];

const questionsChartConfig = {
  count: {
    label: "Questões",
  },
} as const;

const accuracyChartConfig = {
  accuracy: {
    label: "Taxa de Acerto",
    color: "hsl(var(--chart-4))",
  },
} as const;

export default function DashboardClient({
  metrics,
  success,
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  const period = (searchParams.get("period") as Period) ?? "week";
  const { toast } = useToast();

  useEffect(() => {
    if (success) {
      toast({
        title: "Assinatura Premium Ativada!",
        description: "Agora você tem acesso a todos os recursos premium.",
        duration: 5000,
      });
    }
  }, [success, toast]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold sm:text-2xl">Painel de Desempenho</h2>
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <Link key={option.value} href={`?period=${option.value}`} passHref>
              <Button
                variant={period === option.value ? "default" : "ghost"}
                size="sm"
                className="text-xs sm:text-sm"
              >
                {option.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Total de Questões
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Questões respondidas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6">
            <div className="text-xl font-bold sm:text-2xl">
              {metrics?.totalAnswered ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Questões no Período
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Questões respondidas no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6">
            <div className="text-xl font-bold sm:text-2xl">
              {metrics?.periodAnswered ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Taxa de Acerto Total
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Taxa de acerto geral
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6">
            <div className="text-xl font-bold sm:text-2xl">
              {metrics?.totalAccuracy
                ? `${(metrics.totalAccuracy * 100).toFixed(1)}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Taxa de Acerto no Período
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Taxa de acerto no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6">
            <div className="text-xl font-bold sm:text-2xl">
              {metrics?.periodAccuracy
                ? `${(metrics.periodAccuracy * 100).toFixed(1)}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Questões por Período
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Número de questões respondidas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ChartContainer config={questionsChartConfig}>
              <BarChart
                data={metrics?.questionsByPeriod ?? []}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="count"
                  className="fill-sidebar-foreground"
                  radius={[8, 8, 0, 0]}
                >
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 p-4 text-xs sm:p-6 sm:text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {metrics?.periodAnswered && metrics?.totalAnswered ? (
                <>
                  Aumento de{" "}
                  {(
                    (metrics.periodAnswered / metrics.totalAnswered) *
                    100
                  ).toFixed(1)}
                  % no período
                  <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                "Nenhuma questão respondida no período"
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              Mostrando total de questões respondidas no período selecionado
            </div>
          </CardFooter>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              Taxa de Acerto por Período
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Taxa de acerto ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ChartContainer config={accuracyChartConfig}>
              <LineChart
                data={metrics?.accuracyByPeriod ?? []}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  tickMargin={8}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  dot={{
                    fill: "#FFFFFF",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                >
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) =>
                      `${(value * 100).toFixed(1)}%`
                    }
                  />
                </Line>
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 p-4 text-xs sm:p-6 sm:text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {metrics?.periodAccuracy ? (
                <>
                  Taxa de acerto de {(metrics.periodAccuracy * 100).toFixed(1)}%
                  no período
                  <TrendingUp className="h-4 w-4" />
                </>
              ) : (
                "Nenhuma questão respondida no período"
              )}
            </div>
            <div className="leading-none text-muted-foreground">
              Mostrando taxa de acerto no período selecionado
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
