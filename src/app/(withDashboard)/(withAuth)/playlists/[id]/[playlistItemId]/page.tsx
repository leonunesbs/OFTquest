import { type Metadata } from "next";
import { redirect } from "next/navigation";
import PlaylistItem from "~/components/PlaylistItem";
import { api } from "~/trpc/server";
import { getExamMode } from "./actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; playlistItemId: string }>;
}): Promise<Metadata> {
  const { id, playlistItemId } = await params;
  const playlist = await api.playlist.getById({ id });
  const currentItem = playlist?.items.find(
    (item: { id: string }) => item.id === playlistItemId,
  );

  if (!playlist || !currentItem) {
    return {
      title: "Questão não encontrada",
      description: "A questão solicitada não foi encontrada.",
    };
  }

  const questionTitle = `Questão ${currentItem.question.year} - ${currentItem.question.type} #${currentItem.question.number}`;
  const topics =
    currentItem.question.topics?.map((t) => t.name).join(", ") ??
    "Oftalmologia";
  const description = `Questão de ${topics} para o CBO. Acesse a questão completa com explicação detalhada e prepare-se para a prova de título em oftalmologia.`;

  return {
    title: `${questionTitle}`,
    description,
    openGraph: {
      title: `${questionTitle} | OFTQuest`,
      description,
      type: "article",
      publishedTime: currentItem.question.createdAt.toISOString(),
      modifiedTime: currentItem.question.updatedAt.toISOString(),
      authors: ["OFTQuest"],
      tags: [
        ...(currentItem.question.topics?.map((t) => t.name) ?? [
          "Oftalmologia",
        ]),
        "CBO",
        "Oftalmologia",
        "Questões Comentadas",
        "Prova de Título",
      ],
      images: currentItem.question.images.map((image, index) => ({
        url: image,
        alt: `Questão ${currentItem.question.number} - Imagem ${index + 1}`,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${questionTitle} | OFTQuest`,
      description,
      images:
        currentItem.question.images[0] ??
        "https://oftquest.com.br/oftquest-logo.png",
    },
    alternates: {
      canonical: `https://oftquest.com.br/playlists/${(await params).id}/${(await params).playlistItemId}`,
    },
  };
}

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

  if (!currentItem) {
    redirect(`/playlists/${id}`);
  }

  // Enhanced Schema.org structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Questão ${currentItem.question.year} - ${currentItem.question.type} #${currentItem.question.number}`,
    description: `Questão de ${currentItem.question.topics?.map((t) => t.name).join(", ") ?? "Oftalmologia"} para o CBO. Acesse a questão completa com explicação detalhada.`,
    author: {
      "@type": "Organization",
      name: "OFTQuest",
      url: "https://oftquest.com.br",
      logo: {
        "@type": "ImageObject",
        url: "https://oftquest.com.br/oftquest-logo.png",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "OFTQuest",
      logo: {
        "@type": "ImageObject",
        url: "https://oftquest.com.br/oftquest-logo.png",
      },
    },
    datePublished: currentItem.question.createdAt.toISOString(),
    dateModified: currentItem.question.updatedAt.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://oftquest.com.br/playlists/${id}/${playlistItemId}`,
    },
    about: {
      "@type": "Thing",
      name:
        currentItem.question.topics?.map((t) => t.name).join(", ") ??
        "Oftalmologia",
    },
    keywords: [
      ...(currentItem.question.topics?.map((t) => t.name) ?? ["Oftalmologia"]),
      "CBO",
      "Oftalmologia",
      "Questões Comentadas",
      "Prova de Título",
    ],
    inLanguage: "pt-BR",
    isPartOf: {
      "@type": "CollectionPage",
      name: playlist.name,
      url: `https://oftquest.com.br/playlists/${id}`,
    },
    image: currentItem.question.images.map((image, index) => ({
      "@type": "ImageObject",
      url: image,
      caption: `Questão ${currentItem.question.number} - Imagem ${index + 1}`,
    })),
    educationalLevel: "Professional",
    educationalUse: "Exam Preparation",
    learningResourceType: "Practice Question",
    educationalAlignment: {
      "@type": "AlignmentObject",
      alignmentType: "educationalSubject",
      targetName: "Oftalmologia",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PlaylistItem
        playlist={playlist}
        currentItem={currentItem}
        initialExamMode={examMode}
      />
    </>
  );
}
