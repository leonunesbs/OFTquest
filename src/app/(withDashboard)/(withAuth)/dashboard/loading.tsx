import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Skeleton } from "~/components/ui/skeleton";

export default function DashboardLoading() {
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardHeader>
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardHeader>
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardHeader>
            <Skeleton className="h-64 w-full" />
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardHeader>
              <Skeleton className="h-64 w-full" />
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
