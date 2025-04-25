import { Card, CardContent, CardHeader } from "~/components/ui/card";

import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-10" />
        </div>
      </div>
      <Progress value={0} className="mb-6 h-2" />

      <div className="mb-4 flex items-center justify-center">
        <div className="flex items-center gap-1">
          {Array.from({ length: 7 }).map((_, idx) => (
            <Skeleton key={idx} className="h-9 w-9" />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <Skeleton className="mb-2 h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-6" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
