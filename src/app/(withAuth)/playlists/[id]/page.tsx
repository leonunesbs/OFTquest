import { api } from "~/trpc/server";
// src/app/playlists/[id]/page.tsx
import { redirect } from "next/navigation";

export default async function PlaylistIndexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playlist = await api.playlist.getById({ id });

  if (!playlist?.items.length) {
    // Se não existir ou sem itens, redireciona de volta à lista
    redirect("/playlists");
  }

  // Redireciona para a primeira questão assim que carregar no servidor
  redirect(`/playlists/${id}/${playlist.items[0]?.id}`);
}
