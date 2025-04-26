import { type Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

interface QuestionOption {
  text: string;
  images: string[];
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
  images: string[];
}

const CHUNK_SIZE = 250; // Process questions in chunks of 50

export async function POST() {
  try {
    // Buscar questions.json via HTTP (fetch)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/questions.json`,
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar questions.json: ${response.statusText}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const questions: ImportQuestion[] = await response.json();

    // Process questions in chunks
    for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
      const chunk = questions.slice(i, i + CHUNK_SIZE);

      try {
        await db.$transaction(
          async (tx) => {
            // 1. Coletar todos os tópicos únicos
            const allTopics = new Set<string>();
            chunk.forEach((q) => {
              if (q.topic) {
                q.topic.split(", ").forEach((t) => allTopics.add(t.trim()));
              }
            });

            // 2. Criar ou encontrar tópicos
            const topics = await Promise.all(
              Array.from(allTopics).map(async (name) => {
                return tx.topic.upsert({
                  where: { name },
                  create: { name },
                  update: {},
                });
              }),
            );

            // 3. Criar mapa de tópicos
            const topicMap = new Map(topics.map((t) => [t.name, t]));

            // 4. Criar questões (sem o campo topic)
            await tx.question.createMany({
              data: chunk.map((q) => ({
                year: q.year,
                type: q.type,
                number: q.number,
                statement: q.statement,
                explanation: q.explanation ?? "",
                images: q.images,
              })),
              skipDuplicates: true,
            });

            // 5. Buscar IDs das questões criadas
            const questionIds = await tx.question.findMany({
              where: {
                OR: chunk.map((q) => ({
                  AND: {
                    year: q.year,
                    type: q.type,
                    number: q.number,
                  },
                })),
              },
              select: {
                id: true,
                year: true,
                type: true,
                number: true,
              },
            });

            // 6. Conectar questões com seus tópicos
            const questionTopicConnections = chunk
              .map((q) => {
                const questionId = questionIds.find(
                  (qId) =>
                    qId.year === q.year &&
                    qId.type === q.type &&
                    qId.number === q.number,
                )?.id;

                if (!questionId || !q.topic) return null;

                const topicIds = q.topic
                  .split(", ")
                  .map((t) => topicMap.get(t.trim())?.id)
                  .filter((id): id is string => id !== undefined);

                return topicIds.length > 0
                  ? {
                      questionId,
                      topicIds,
                    }
                  : null;
              })
              .filter(
                (conn): conn is { questionId: string; topicIds: string[] } =>
                  conn !== null,
              );

            // Execute updates sequentially instead of using Promise.all
            for (const conn of questionTopicConnections) {
              await tx.question.update({
                where: { id: conn.questionId },
                data: {
                  topics: {
                    connect: conn.topicIds.map((id) => ({ id })),
                  },
                },
              });
            }

            // Create options for this chunk
            const chunkOptions = chunk.flatMap((q) => {
              const questionId = questionIds.find(
                (qId) =>
                  qId.year === q.year &&
                  qId.type === q.type &&
                  qId.number === q.number,
              )?.id;
              if (!questionId) {
                throw new Error(
                  `Failed to find question ID for year ${q.year}, type ${q.type}, number ${q.number}`,
                );
              }
              // Filter out options with empty text and image, and ensure no duplicates
              const uniqueOptions = new Map<string, QuestionOption>();
              q.options
                .filter((opt) => opt.text !== "" || opt.images.length > 0)
                .forEach((opt) => {
                  const key = `${opt.text}-${opt.images.join(",")}`;
                  if (!uniqueOptions.has(key)) {
                    uniqueOptions.set(key, opt);
                  }
                });

              return Array.from(uniqueOptions.values()).map((opt) => ({
                questionId,
                text: opt.text,
                images: opt.images,
                isCorrect: opt.isCorrect,
              }));
            });

            // Create new options
            await tx.option.createMany({
              data: chunkOptions,
              skipDuplicates: true,
            });
          },
          {
            timeout: 10 * 60 * 1000, // 10 minutes timeout per chunk
            maxWait: 10 * 60 * 1000, // 10 minutes max wait per chunk
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
        // Get all questions with their topics
        const questionsWithTopics = await tx.question.findMany({
          include: {
            topics: true,
          },
        });

        // Calculate topic statistics
        const topicStats = new Map<string, Map<string, Map<number, number>>>();

        questionsWithTopics.forEach((question) => {
          question.topics.forEach((topic) => {
            if (!topicStats.has(topic.name)) {
              topicStats.set(topic.name, new Map());
            }
            const typeMap = topicStats.get(topic.name)!;

            if (!typeMap.has(question.type)) {
              typeMap.set(question.type, new Map());
            }
            const yearMap = typeMap.get(question.type)!;

            yearMap.set(question.year, (yearMap.get(question.year) ?? 0) + 1);
          });
        });

        // Calculate total questions per year and type
        const yearTypeTotals = new Map<string, number>();
        questionsWithTopics.forEach((question) => {
          const key = `${question.year}-${question.type}`;
          yearTypeTotals.set(key, (yearTypeTotals.get(key) ?? 0) + 1);
        });

        // Prepare and upsert TopicPrevalence records
        const prevalencePromises: Promise<
          Prisma.TopicPrevalenceGetPayload<object>
        >[] = [];

        topicStats.forEach((typeMap, topic) => {
          typeMap.forEach((yearMap, examType) => {
            yearMap.forEach((count, year) => {
              const totalQuestions =
                yearTypeTotals.get(`${year}-${examType}`) ?? 0;
              const prevalence =
                totalQuestions > 0 ? count / totalQuestions : 0;

              prevalencePromises.push(
                tx.topicPrevalence.upsert({
                  where: {
                    topic_examType_year: {
                      topic,
                      examType,
                      year,
                    },
                  },
                  update: {
                    count,
                    prevalence,
                    updatedAt: new Date(),
                  },
                  create: {
                    topic,
                    examType,
                    year,
                    count,
                    prevalence,
                    updatedAt: new Date(),
                  },
                }),
              );
            });
          });
        });

        // Execute prevalence updates sequentially instead of using Promise.all
        for (const promise of prevalencePromises) {
          await promise;
        }
      },
      {
        timeout: 10 * 60 * 1000, // 10 minutes timeout
        maxWait: 10 * 60 * 1000, // 10 minutes max wait
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
