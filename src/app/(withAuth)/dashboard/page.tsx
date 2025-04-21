import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <div className="container py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seu Desempenho</CardTitle>
          <CardDescription>
            Veja suas métricas de acerto, prevalência de temas e atividade.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* tudo que precisa de hooks e gráfico roda no client */}
      <DashboardClient />
    </div>
  );
}
