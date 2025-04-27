import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

export default function PlaylistsLoading() {
  return (
    <div className="container space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Minhas Playlists
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie suas playlists de questões
          </p>
        </div>
        <Button disabled size="lg">
          <Plus className="mr-2 h-4 w-4" /> Nova Playlist
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="group relative flex h-full flex-col overflow-hidden"
          >
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-3/4" />
              </CardTitle>
              <CardDescription>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 w-20" />
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10" />
          ))}
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
}
