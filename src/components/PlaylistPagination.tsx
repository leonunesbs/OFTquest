"use client";

import { type Prisma } from "@prisma/client";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

interface PlaylistPaginationProps {
  playlist: Prisma.PlaylistGetPayload<{
    include: {
      items: {
        include: {
          question: {
            include: {
              options: true;
            };
          };
        };
      };
    };
  }>;
  currentIndex: number;
  examMode: boolean;
}

export default function PlaylistPagination({
  playlist,
  currentIndex,
  examMode,
}: PlaylistPaginationProps) {
  const items = playlist.items;

  return (
    <div className="flex items-center justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst
              href={`/playlists/${playlist.id}/${items[0]?.id}`}
              className={
                currentIndex <= 0 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              href={`/playlists/${playlist.id}/${items[currentIndex - 1]?.id}`}
              className={
                currentIndex <= 0 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {items
            .slice(
              Math.max(0, currentIndex - 2),
              Math.min(items.length, currentIndex + 3),
            )
            .map((it, idx) => {
              const actualIndex = Math.max(0, currentIndex - 2) + idx;
              const done = Boolean(it.selectedOptionId);
              const correct =
                done &&
                it.question.options.some(
                  (o) => o.id === it.selectedOptionId && o.isCorrect,
                );
              return (
                <PaginationItem key={it.id}>
                  <PaginationLink
                    href={`/playlists/${playlist.id}/${it.id}`}
                    isActive={actualIndex === currentIndex}
                    className={`${
                      actualIndex === currentIndex ? "rounded border" : ""
                    } ${done && !examMode ? (correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400") : ""}`}
                  >
                    {actualIndex + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

          <PaginationItem>
            <PaginationNext
              href={`/playlists/${playlist.id}/${items[currentIndex + 1]?.id}`}
              className={
                currentIndex >= items.length - 1
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLast
              href={`/playlists/${playlist.id}/${items[items.length - 1]?.id}`}
              className={
                currentIndex >= items.length - 1
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
