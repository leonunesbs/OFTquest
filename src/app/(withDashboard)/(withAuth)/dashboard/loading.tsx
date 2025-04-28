import { Card, CardContent, CardHeader } from "~/components/ui/card";

import { Skeleton } from "~/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="transition-shadow hover:shadow-md">
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1 h-4 w-24" />
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6">
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="transition-shadow hover:shadow-md">
            <CardHeader className="p-4 sm:p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-1 h-4 w-32" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-[300px] sm:h-[400px]">
                <Skeleton className="h-full w-full" />
              </div>
            </CardContent>
            <div className="flex-col items-start gap-2 p-4 text-xs sm:p-6 sm:text-sm">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-2 h-4 w-64" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
