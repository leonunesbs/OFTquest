import { Card, CardContent, CardHeader } from "~/components/ui/card";

import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="mb-4 h-8 w-64" />
      <Progress value={0} className="mb-6 h-2" />

      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-9" />
        ))}
      </div>

      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <Skeleton className="mb-2 h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
