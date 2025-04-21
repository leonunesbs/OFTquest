import { api } from "~/trpc/server";
import PlaylistItem from "./PlaylistItem";
// src/app/playlists/[id]/[playlistItemId]/page.tsx
import { redirect } from "next/navigation";

export default async function PlaylistItemPage({
  params,
}: {
  params: Promise<{ id: string; playlistItemId: string }>;
}) {
  const { id, playlistItemId } = await params;
  const playlist = await api.playlist.getById({ id });

  if (!playlist) {
    redirect("/playlists");
  }

  const currentIndex = playlist.items.findIndex(
    (item) => item.id === playlistItemId,
  );

  if (currentIndex === -1) {
    redirect(`/playlists/${id}`);
  }

  const currentItem = playlist.items[currentIndex];

  return (
    <PlaylistItem
      playlist={playlist}
      currentItem={currentItem!}
      currentIndex={currentIndex}
    />
  );
}
