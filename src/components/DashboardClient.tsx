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

import { Button } from "./ui/button";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";

type Period = "week" | "month" | "last30days" | "year";

interface MetricsData {
  totalAnswered: number;
  totalAccuracy: number;
  periodAnswered: number;
  periodAccuracy: number;
  questionsByPeriod: Array<{ period: string; count: number }>;
  accuracyByPeriod: Array<{ period: string; accuracy: number }>;
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

export default function DashboardClient({ metrics }: { metrics: MetricsData }) {
  const searchParams = useSearchParams();
  const period = (searchParams.get("period") as Period) ?? "week";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Painel de Desempenho</h2>
        <div className="flex gap-2">
          {periodOptions.map((option) => (
            <Link key={option.value} href={`?period=${option.value}`} passHref>
              <Button
                variant={period === option.value ? "default" : "ghost"}
                size="sm"
              >
                {option.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de Questões</CardTitle>
            <CardDescription>Questões respondidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalAnswered ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questões no Período</CardTitle>
            <CardDescription>
              Questões respondidas no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.periodAnswered ?? 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Acerto Total</CardTitle>
            <CardDescription>Taxa de acerto geral</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalAccuracy
                ? `${(metrics.totalAccuracy * 100).toFixed(1)}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Acerto no Período</CardTitle>
            <CardDescription>
              Taxa de acerto no período selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.periodAccuracy
                ? `${(metrics.periodAccuracy * 100).toFixed(1)}%`
                : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Questões por Período</CardTitle>
            <CardDescription>Número de questões respondidas</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={questionsChartConfig}>
              <BarChart
                data={metrics?.questionsByPeriod ?? []}
                margin={{ top: 20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
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
          <CardFooter className="flex-col items-start gap-2 text-sm">
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

        <Card>
          <CardHeader>
            <CardTitle>Taxa de Acerto por Período</CardTitle>
            <CardDescription>Taxa de acerto ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={accuracyChartConfig}>
              <LineChart
                data={metrics?.accuracyByPeriod ?? []}
                margin={{
                  top: 20,
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  tickMargin={8}
                  axisLine={false}
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
          <CardFooter className="flex-col items-start gap-2 text-sm">
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
