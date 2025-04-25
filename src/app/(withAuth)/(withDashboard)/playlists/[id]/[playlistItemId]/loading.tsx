import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Skeleton } from "~/components/ui/skeleton";

export default function PlaylistItemLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="mt-2 h-4 w-32" />
            </CardDescription>
          </div>
          <Skeleton className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardFooter>
    </Card>
  );
}
