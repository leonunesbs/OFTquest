import { NextResponse } from "next/server";
import { db } from "~/server/db";

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

const CHUNK_SIZE = 50; // Process questions in chunks of 50

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

    // Process questions in chunks
    for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
      const chunk = questions.slice(i, i + CHUNK_SIZE);

      try {
        await db.$transaction(
          async (tx) => {
            // Create questions for this chunk
            await tx.question.createMany({
              data: chunk.map((q) => ({
                year: q.year,
                type: q.type,
                number: q.number,
                topic: q.topic ?? "",
                statement: q.statement,
                explanation: q.explanation ?? "",
                image: q.image ?? "",
              })),
            });

            // Get the created question IDs with their identifying information
            const questionIds = await tx.question.findMany({
              where: {
                year: { in: chunk.map((q) => q.year) },
                type: { in: chunk.map((q) => q.type) },
                number: { in: chunk.map((q) => q.number) },
              },
              select: {
                id: true,
                year: true,
                type: true,
                number: true,
              },
            });

            // Create a map for quick lookup of question IDs
            const questionIdMap = new Map(
              questionIds.map((q) => [`${q.year}-${q.type}-${q.number}`, q.id]),
            );

            // Create options for this chunk
            const chunkOptions = chunk.flatMap((q) => {
              const questionId = questionIdMap.get(
                `${q.year}-${q.type}-${q.number}`,
              );
              if (!questionId) {
                throw new Error(
                  `Failed to find question ID for year ${q.year}, type ${q.type}, number ${q.number}`,
                );
              }
              // Filter out options with empty text and image
              return q.options
                .filter((opt) => opt.text !== "" || opt.image !== "")
                .map((opt) => ({
                  questionId,
                  text: opt.text,
                  image: opt.image,
                  isCorrect: opt.isCorrect,
                }));
            });

            // Create new options
            await tx.option.createMany({
              data: chunkOptions,
              skipDuplicates: true, // Skip if option already exists
            });
          },
          {
            timeout: 30 * 1000, // 30 seconds timeout per chunk
            maxWait: 30 * 1000, // 30 seconds max wait per chunk
          },
        );
      } catch (chunkError) {
        console.error(
          `Erro ao processar chunk ${i / CHUNK_SIZE + 1}:`,
          chunkError,
        );
        throw new Error(
          `Falha ao processar chunk de questões ${i / CHUNK_SIZE + 1}`,
        );
      }
    }

    // Generate TopicPrevalences after all questions are imported
    await db.$transaction(
      async (tx) => {
        // Get all unique combinations of year, type, and topic
        const topicStats = await tx.question.groupBy({
          by: ["year", "type", "topic"],
          _count: true,
        });

        // Calculate total questions per year and type
        const yearTypeTotals = await tx.question.groupBy({
          by: ["year", "type"],
          _count: true,
        });

        // Create a map for quick lookup of total questions per year and type
        const yearTypeTotalMap = new Map(
          yearTypeTotals.map(({ year, type, _count }) => [
            `${year}-${type}`,
            _count,
          ]),
        );

        // Prepare TopicPrevalence data
        const prevalenceData = topicStats.map(
          ({ year, type, topic, _count }) => {
            const totalQuestions = yearTypeTotalMap.get(`${year}-${type}`) ?? 0;
            const prevalence = totalQuestions > 0 ? _count / totalQuestions : 0;

            return {
              topic,
              examType: type,
              year,
              count: _count,
              prevalence,
            };
          },
        );

        // Upsert TopicPrevalence records
        await Promise.all(
          prevalenceData.map((data) =>
            tx.topicPrevalence.upsert({
              where: {
                topic_examType_year: {
                  topic: data.topic,
                  examType: data.examType,
                  year: data.year,
                },
              },
              update: {
                count: data.count,
                prevalence: data.prevalence,
              },
              create: {
                topic: data.topic,
                examType: data.examType,
                year: data.year,
                count: data.count,
                prevalence: data.prevalence,
              },
            }),
          ),
        );
      },
      {
        timeout: 5 * 60 * 1000, // 5 minutes timeout per chunk
        maxWait: 5 * 60 * 1000, // 5 minutes max wait per chunk
      },
    );

    return NextResponse.json({ message: "Importação concluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao importar questões:", error);
    return NextResponse.json({ error: "Falha na importação" }, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}
