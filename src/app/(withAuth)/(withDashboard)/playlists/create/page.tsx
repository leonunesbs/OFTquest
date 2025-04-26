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
    <div>
      <Card className="mx-auto max-w-2xl">
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
