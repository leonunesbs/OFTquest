import { redirect } from "next/navigation";
import PlaylistItem from "~/components/PlaylistItem";
import { api } from "~/trpc/server";
import { getExamMode } from "./actions";

export default async function PlaylistItemPage({
  params,
}: {
  params: Promise<{ id: string; playlistItemId: string }>;
}) {
  const { id, playlistItemId } = await params;
  const playlist = await api.playlist.getById({ id });
  const examMode = await getExamMode();

  if (!playlist) {
    redirect("/playlists");
  }

  const currentIndex = playlist.items.findIndex(
    (item: { id: string }) => item.id === playlistItemId,
  );

  if (currentIndex === -1) {
    redirect(`/playlists/${id}`);
  }

  const currentItem = playlist.items[currentIndex];

  return (
    <PlaylistItem
      playlist={playlist}
      currentItem={currentItem!}
      initialExamMode={examMode}
    />
  );
}
