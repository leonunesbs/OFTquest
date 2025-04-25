"use client";

import { PaginationLink } from "~/components/ui/pagination";

interface PlaylistPaginationLinkProps {
  href: string;
  isActive: boolean;
  done: boolean;
  correct: boolean;
  examMode: boolean;
  number: number;
}

export default function PlaylistPaginationLink({
  href,
  isActive,
  done,
  correct,
  examMode,
  number,
}: PlaylistPaginationLinkProps) {
  return (
    <PaginationLink
      href={href}
      isActive={isActive}
      className={`${
        isActive ? "rounded border" : ""
      } ${done && !examMode ? (correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400") : ""}`}
    >
      {number}
    </PaginationLink>
  );
}
