import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

export default function PlaylistsLoading() {
  return (
    <div className="container space-y-6">
      <div className="flex justify-end">
        <Button disabled>Nova Playlist</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="group">
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-3/4" />
              </CardTitle>
              <CardDescription>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button disabled variant="outline">
                Ver detalhes
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
