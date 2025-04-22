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
