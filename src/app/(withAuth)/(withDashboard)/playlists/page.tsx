// src/app/playlists/page.tsx
import { BookOpen, CheckCircle2, Clock, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Minhas Playlists",
};

const ITEMS_PER_PAGE = 6;

export default async function PlaylistsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/");

  const currentPage = Number(page) || 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const [playlists, totalPlaylists] = await Promise.all([
    db.playlist.findMany({
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
      take: ITEMS_PER_PAGE,
      skip,
    }),
    db.playlist.count(),
  ]);

  const totalPages = Math.ceil(totalPlaylists / ITEMS_PER_PAGE);

  // Caso não haja nenhuma playlist ainda
  if (playlists.length === 0) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center">
        <Card className="mx-auto max-w-lg text-center">
          <CardHeader>
            <CardTitle>Você ainda não tem playlists</CardTitle>
            <CardDescription>
              Crie uma nova playlist para começar a praticar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Minhas Playlists
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie suas playlists de questões
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/playlists/create">
            <Plus className="mr-2 h-4 w-4" /> Nova Playlist
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((pl) => (
          <Card
            key={pl.id}
            className="group relative flex h-full flex-col overflow-hidden transition-all"
          >
            <CardHeader>
              <CardTitle className="line-clamp-1 text-xl">{pl.name}</CardTitle>
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
                  <Badge key={topic} variant="secondary">
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

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`/playlists?page=${currentPage - 1}`}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/playlists?page=${page}`}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href={`/playlists?page=${currentPage + 1}`}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
