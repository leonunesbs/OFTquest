// src/app/playlists/create/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import PlaylistForm, { availableYears } from "./PlaylistForm";

export default function CreatePlaylistPage() {
  return (
    <div className="container py-10">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Criar Nova Playlist</CardTitle>
          <CardDescription>
            Gere uma playlist personalizada baseada nos temas mais relevantes
            para você, filtrando por ano de prova.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Delegate all interactivity to the client component */}
          <PlaylistForm availableYears={availableYears} />
        </CardContent>
      </Card>
    </div>
  );
}
