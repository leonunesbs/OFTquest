// src/app/(withAuth)/dashboard/DashboardClient.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-6 w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">{children}</CardContent>
    </Card>
  );
}

export default function DashboardClient() {
  // **1. Hooks no topo**
  const [activeTab, setActiveTab] = useState<
    "accuracy" | "prevalence" | "activity"
  >("accuracy");
  const [period, setPeriod] = useState<"1A" | "2A" | "3A" | "5A">("5A");
  const { data, isLoading } = api.playlist.getUserTopicMetrics.useQuery({
    period,
  });
  const metrics = useMemo(() => data ?? [], [data]);

  // **2. useMemo sempre chamado**
  const accuracyData = useMemo(
    () =>
      metrics
        .filter((m) => m.questionsCount > 0)
        .map((m) => ({ topic: m.topic, value: Math.round(m.accuracy * 100) }))
        .sort((a, b) => a.value - b.value),
    [metrics],
  );

  const prevalenceData = useMemo(
    () =>
      metrics
        .map((m) => ({ topic: m.topic, value: Math.round(m.prevalence * 100) }))
        .sort((a, b) => b.value - a.value),
    [metrics],
  );

  const activityData = useMemo(
    () =>
      metrics
        .filter((m) => m.questionsCount > 0)
        .map((m) => ({
          topic: m.topic,
          responded: m.questionsCount,
          correct: m.correctCount,
        }))
        .sort((a, b) => b.responded - a.responded),
    [metrics],
  );

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

  // **4. Renderização dos gráficos em tabs**
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "accuracy" | "prevalence" | "activity")
          }
          defaultValue="accuracy"
        >
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="accuracy">Taxa de Acertos</TabsTrigger>
            <TabsTrigger value="prevalence">Prevalência</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select
          value={period}
          onValueChange={(v) => setPeriod(v as "1A" | "2A" | "3A" | "5A")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1A">Último ano</SelectItem>
            <SelectItem value="2A">Últimos 2 anos</SelectItem>
            <SelectItem value="3A">Últimos 3 anos</SelectItem>
            <SelectItem value="5A">Últimos 5 anos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Tabs>
        <TabsContent value="accuracy">
          <ChartCard
            title="Taxa de Acertos por Tema"
            description="Seu desempenho percentual em cada tema."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={accuracyData}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis dataKey="topic" type="category" width={120} />
                <Tooltip formatter={(val: number) => `${val}%`} />
                <Legend />
                <Bar dataKey="value" name="Acertos (%)" fill={COLORS[0]}>
                  {accuracyData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="prevalence">
          <ChartCard
            title="Prevalência de Temas"
            description="Percentual de ocorrência dos temas nas provas."
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prevalenceData}
                  dataKey="value"
                  nameKey="topic"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  // removido 'label' para evitar template literal error
                >
                  {prevalenceData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `${val}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="activity">
          <ChartCard
            title="Atividade por Tema"
            description="Quantidade de questões respondidas e corretas."
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityData}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="topic" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="responded" name="Respondidas" fill={COLORS[1]} />
                <Bar dataKey="correct" name="Corretas" fill={COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
