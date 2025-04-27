// src/app/admin/questions/[id]/edit/page.tsx
import { type Prisma } from "@prisma/client";
import { notFound } from "next/navigation";
import QuestionEditForm from "~/components/QuestionEditForm";
import { db } from "~/server/db";

// Esta é a parte Server Component
export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isEditing = id !== "new";

  // Buscar dados no servidor se estiver editando
  let questionData: Prisma.QuestionGetPayload<{
    include: { options: true; topics: true };
  }> | null = null;
  let topicsData: string[] = [];

  // Buscar temas disponíveis no servidor
  try {
    topicsData = await db.topic
      .findMany({
        select: {
          name: true,
        },
      })
      .then((topics) => topics.map((t) => t.name));
  } catch (error) {
    console.error("Erro ao buscar temas:", error);
  }

  // Buscar questão se estiver editando
  if (isEditing) {
    try {
      questionData = await db.question.findUnique({
        where: { id },
        include: {
          options: true,
          topics: true,
        },
      });

      if (!questionData) {
        notFound();
      }
    } catch (error) {
      console.error("Erro ao buscar questão:", error);
      notFound();
    }
  }

  // Passar os dados para o Client Component
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        {isEditing ? "Editar Questão" : "Nova Questão"}
      </h1>

      <QuestionEditForm
        questionData={questionData!}
        topicsData={topicsData}
        isEditing={isEditing}
        id={id}
      />
    </div>
  );
}
