import { type Option, PrismaClient } from "@prisma/client";

import { NextResponse } from "next/server";

const prisma = new PrismaClient();

interface QuestionOption {
  text: string;
  image: string;
  isCorrect: boolean;
}

interface ImportQuestion {
  year: number;
  type: string;
  number: number;
  topic: string | null;
  statement: string;
  options: QuestionOption[];
  explanation: string | null;
  image: string | null;
}

export async function POST() {
  try {
    // Buscar questoes.json via HTTP (fetch)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://oftquest.vercel.app"}/questoes.json`,
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar questoes.json: ${response.statusText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const questions: ImportQuestion[] = await response.json();

    // Inserir todas as questões e opções em uma única transação
    try {
      await prisma.$transaction(
        async (tx) => {
          // Criar todas as questões de uma vez
          const questionsData = questions.map((q) => ({
            year: q.year,
            type: q.type,
            number: q.number,
            topic: q.topic ?? "",
            statement: q.statement,
            explanation: q.explanation ?? "",
            image: q.image ?? "",
          }));

          const createdQuestions = await tx.question.createMany({
            data: questionsData,
            skipDuplicates: true,
          });

          // Buscar os IDs das questões criadas
          const questionIds = await tx.question.findMany({
            select: { id: true },
            orderBy: { id: "desc" },
            take: createdQuestions.count,
          });

          // Criar todas as opções de uma vez
          const allOptions: Omit<Option, "id">[] = questions.flatMap(
            (q, index) =>
              q.options.map((opt) => ({
                questionId: questionIds[index]?.id ?? "",
                text: opt.text,
                image: opt.image,
                isCorrect: opt.isCorrect,
              })),
          );

          await tx.option.createMany({
            data: allOptions,
            skipDuplicates: true,
          });
        },
        {
          timeout: 5 * 60000, // 5 minutos de timeout
          maxWait: 5 * 60000, // 5 minutos de espera máxima
        },
      );
    } catch (transactionError) {
      console.error("Erro na transação:", transactionError);
      throw new Error("Falha na transação de importação");
    }

    return NextResponse.json({ message: "Importação concluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao importar questões:", error);
    return NextResponse.json({ error: "Falha na importação" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
