import ExamModeToggle from "~/components/ExamModeToggle";
import PlaylistPagination from "~/components/PlaylistPagination";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/server";
import { getExamMode } from "./actions";

export default async function PlaylistItemLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string; playlistItemId: string };
}) {
  const { id } = params;
  const playlist = await api.playlist.getById({ id });
  const examMode = await getExamMode();

  if (!playlist) {
    return null;
  }

  const currentIndex = playlist.items.findIndex(
    (item: { id: string }) => item.id === params.playlistItemId,
  );

  if (currentIndex === -1) {
    return null;
  }

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
        {children}
        <PlaylistPagination
          playlist={playlist}
          currentIndex={currentIndex}
          examMode={examMode}
        />
      </div>
    </div>
  );
}
