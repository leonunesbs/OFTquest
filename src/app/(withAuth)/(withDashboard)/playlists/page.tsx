// src/app/playlists/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

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
      items: true,
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
    <div className="container space-y-6">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/playlists/create">Nova Playlist</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((pl) => (
          <Card key={pl.id} className="group">
            <CardHeader>
              <CardTitle>{pl.name}</CardTitle>
              <CardDescription>
                <div className="space-y-2">
                  <p>{pl.items.length} questões</p>
                  {pl.playlistMetric && (
                    <div className="space-y-1">
                      <p>Respondidas: {pl.playlistMetric.answeredQuestions}</p>
                      <p>Acertos: {pl.playlistMetric.correctAnswers}</p>
                      <p>
                        Taxa de acerto:{" "}
                        {(pl.playlistMetric.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={`/playlists/${pl.id}`}>Ver detalhes</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
