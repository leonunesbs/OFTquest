import { redirect } from "next/navigation";
import ExamModeToggle from "~/components/ExamModeToggle";
import PlaylistItem from "~/components/PlaylistItem";
import PlaylistPagination from "~/components/PlaylistPagination";
import { Progress } from "~/components/ui/progress";
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
    (item) => item.id === playlistItemId,
  );

  if (currentIndex === -1) {
    redirect(`/playlists/${id}`);
  }

  const currentItem = playlist.items[currentIndex];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <ExamModeToggle initialExamMode={examMode} />
      </div>
      <div className="mb-6">
        <Progress value={((currentIndex + 1) / playlist.items.length) * 100} />
      </div>
      <div className="space-y-4">
        <PlaylistPagination
          playlist={playlist}
          currentIndex={currentIndex}
          examMode={examMode}
        />

        <PlaylistItem
          playlist={playlist}
          currentItem={currentItem!}
          initialExamMode={examMode}
        />

        <PlaylistPagination
          playlist={playlist}
          currentIndex={currentIndex}
          examMode={examMode}
        />
      </div>
    </div>
  );
}
