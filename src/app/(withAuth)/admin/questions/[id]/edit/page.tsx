import { type Prisma } from "@prisma/client";
import { db } from "~/server/db";
import QuestionEditForm from "./QuestionEditForm";
// src/app/admin/questions/[id]/edit/page.tsx
import { notFound } from "next/navigation";

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
    include: { options: true };
  }> | null = null;
  let topicsData: string[] = [];

  // Buscar temas disponíveis no servidor
  try {
    topicsData = await db.question
      .groupBy({
        by: ["topic"],
      })
      .then((topics) => topics.map((t) => t.topic));
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
    <div className="container py-10">
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
