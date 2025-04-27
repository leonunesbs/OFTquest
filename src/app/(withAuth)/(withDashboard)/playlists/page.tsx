import { BookOpen, CheckCircle2, Clock } from "lucide-react";
// src/app/playlists/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Minhas Playlists",
};

export default async function PlaylistsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const playlists = await db.playlist.findMany({
    include: {
      items: {
        include: {
          question: {
            include: {
              topics: true,
            },
          },
        },
      },
      playlistMetric: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Caso não haja nenhuma playlist ainda
  if (playlists.length === 0) {
    return (
      <div>
        <Card className="mx-auto max-w-lg text-center">
          <CardHeader>
            <CardTitle>Você ainda não tem playlists</CardTitle>
            <CardDescription>
              Crie uma nova playlist para começar a praticar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/playlists/create">Criar Playlist</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Lista as playlists existentes
  return (
    <div className="container space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas Playlists</h1>
        <Button asChild>
          <Link href="/playlists/create">Nova Playlist</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((pl) => (
          <Card
            key={pl.id}
            className="group flex h-full flex-col transition-all hover:shadow"
          >
            <CardHeader>
              <CardTitle className="line-clamp-1">{pl.name}</CardTitle>
              <CardDescription>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>{pl.items.length} questões</span>
                  </div>
                  {pl.playlistMetric && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Respondidas: {pl.playlistMetric.answeredQuestions}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Acertos: {pl.playlistMetric.correctAnswers} (
                          {(pl.playlistMetric.accuracy * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-wrap gap-1.5">
                {Array.from(
                  new Set(
                    pl.items.flatMap((item) =>
                      item.question.topics.map((topic) => topic.name),
                    ),
                  ),
                ).map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/playlists/${pl.id}`}>Ver detalhes</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
