import { Plus } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "Playlists | OFTQuest",
  description: "Gerencie suas playlists de questões para prática e estudo.",
};

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
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
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
