// src/app/playlists/[id]/page.tsx
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function PlaylistIndexPage({
  params,
}: {
  params: { id: string };
}) {
  const playlist = await api.playlist.getById({ id: params.id });

  if (!playlist?.items.length) {
    // Se não existir ou sem itens, redireciona de volta à lista
    redirect("/playlists");
  }

  // Redireciona para a primeira questão assim que carregar no servidor
  redirect(`/playlists/${params.id}/${playlist.items[0]?.id}`);
}
