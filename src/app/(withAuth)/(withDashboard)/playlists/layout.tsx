import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Playlists",
  description: "Gerencie suas playlists de questões para prática e estudo.",
};

export default function PlaylistsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
