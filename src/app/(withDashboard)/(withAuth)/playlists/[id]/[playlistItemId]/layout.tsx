import ExamModeToggle from "~/components/ExamModeToggle";
import PlaylistPagination from "~/components/PlaylistPagination";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/server";
import { getExamMode } from "./actions";
import PlaylistItemLoading from "./loading";

export default async function PlaylistItemLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string; playlistItemId: string }>;
}) {
  const { id, playlistItemId } = await params;
  const playlist = await api.playlist.getById({ id });
  const examMode = await getExamMode();
  const currentIndex = playlist?.items.findIndex(
    (item: { id: string }) => item.id === playlistItemId,
  );

  if (!playlist || currentIndex === -1) {
    return <PlaylistItemLoading />;
  }

  const index = currentIndex!;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <ExamModeToggle initialExamMode={examMode} />
      </div>
      <div className="mb-6">
        <Progress value={((index + 1) / playlist.items.length) * 100} />
      </div>
      <div className="space-y-4">
        <PlaylistPagination
          key={`${playlistItemId}-top`}
          playlist={playlist}
          currentIndex={index}
          examMode={examMode}
        />
        {children}
        <PlaylistPagination
          key={`${playlistItemId}-bottom`}
          playlist={playlist}
          currentIndex={index}
          examMode={examMode}
        />
      </div>
    </div>
  );
}
