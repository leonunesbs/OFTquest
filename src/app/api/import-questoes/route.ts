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

function cleanText(text: string | null): string {
  if (!text) return "";
  return text.replace(/[\n\t]+/g, " ").trim();
}

export async function POST() {
  try {
    // 1. Fetch questions.json
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/questions.json`,
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch questions.json: ${res.statusText}`);
    }
    const questions = (await res.json()) as ImportQuestion[];

    // 2. Extract unique topic names across all questions
    const allTopicNames = Array.from(
      new Set(
        questions.flatMap((q) =>
          q.topic ? q.topic.split(", ").map((t) => t.trim()) : [],
        ),
      ),
    );

    // Execute in a single transaction to minimize round-trips
    await db.$transaction(
      async (tx) => {
        // 3. Upsert all topics once
        await Promise.all(
          allTopicNames.map((name) =>
            tx.topic.upsert({
              where: { name },
              create: { name },
              update: {},
            }),
          ),
        );

        // 4. Fetch topic IDs
        const topics = await tx.topic.findMany({
          where: { name: { in: allTopicNames } },
          select: { id: true, name: true },
        });
        const topicMap = new Map(topics.map((t) => [t.name, t.id]));

        // 5. Bulk create questions
        const questionData = questions.map((q) => ({
          year: q.year,
          type: q.type,
          number: q.number,
          statement: cleanText(q.statement),
          explanation: cleanText(q.explanation),
          images: q.images,
        }));
        await tx.question.createMany({
          data: questionData,
          skipDuplicates: true,
        });

        // 6. Fetch created question IDs
        const created = await tx.question.findMany({
          where: {
            OR: questions.map((q) => ({
              year: q.year,
              type: q.type,
              number: q.number,
            })),
          },
          select: { id: true, year: true, type: true, number: true },
        });
        const questionMap = new Map(
          created.map((r) => [`${r.year}-${r.type}-${r.number}`, r.id]),
        );

        // 7. Bulk create options
        const optionsData = questions.flatMap((q) => {
          const qId = questionMap.get(`${q.year}-${q.type}-${q.number}`)!;
          const uniq = new Map<string, QuestionOption>();
          q.options
            .filter((opt) => opt.text || opt.images.length)
            .forEach((opt) => {
              const key = `${opt.text}-${opt.images.join(",")}`;
              if (!uniq.has(key)) uniq.set(key, opt);
            });
          return Array.from(uniq.values()).map((opt) => ({
            questionId: qId,
            text: cleanText(opt.text),
            images: opt.images,
            isCorrect: opt.isCorrect,
          }));
        });
        if (optionsData.length) {
          await tx.option.createMany({
            data: optionsData,
            skipDuplicates: true,
          });
        }

        // 8. Bulk connect topics via raw INSERT on the implicit join table
        const connections = questions.flatMap((q) => {
          const qId = questionMap.get(`${q.year}-${q.type}-${q.number}`);
          if (!q.topic || !qId) return [];
          return q.topic.split(", ").map((name) => ({
            questionId: qId,
            topicId: topicMap.get(name)!,
          }));
        });
        if (connections.length) {
          const values = connections
            .map(({ questionId, topicId }) => `('${questionId}','${topicId}')`)
            .join(",");
          // Adjust table/column names per your Prisma setup
          await tx.$executeRawUnsafe(
            `INSERT INTO "public"."_QuestionToTopic" ("A","B") VALUES ${values} ON CONFLICT ("A","B") DO NOTHING`,
          );
        }

        // 9. Compute and upsert topic prevalence
        //    Aggregate counts in-memory, then upsert in a batch
        const stats = new Map<string, Map<string, Map<number, number>>>();

        const questionsWithTopics = await tx.question.findMany({
          include: { topics: true },
        });
        questionsWithTopics.forEach((q) => {
          q.topics.forEach((t) => {
            if (!stats.has(t.name)) stats.set(t.name, new Map());
            const typeMap = stats.get(t.name)!;
            if (!typeMap.has(q.type)) typeMap.set(q.type, new Map());
            const yearMap = typeMap.get(q.type)!;
            yearMap.set(q.year, (yearMap.get(q.year) ?? 0) + 1);
          });
        });

        // Totals per year/type
        const totals = new Map<string, number>();
        questionsWithTopics.forEach((q) => {
          const key = `${q.year}-${q.type}`;
          totals.set(key, (totals.get(key) ?? 0) + 1);
        });

        // Prepare upserts
        const upserts: Promise<Prisma.TopicPrevalenceGetPayload<object>>[] = [];
        stats.forEach((typeMap, topic) => {
          typeMap.forEach((yearMap, examType) => {
            yearMap.forEach((count, year) => {
              const total = totals.get(`${year}-${examType}`) ?? 0;
              const prevalence = total ? count / total : 0;
              upserts.push(
                tx.topicPrevalence.upsert({
                  where: { topic_examType_year: { topic, examType, year } },
                  update: { count, prevalence, updatedAt: new Date() },
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
        await Promise.all(upserts);
      },
      {
        timeout: 1000 * 60 * 5, // 5 minutes
        maxWait: 1000 * 60 * 5, // 5 minutes
      },
    );

    return NextResponse.json({ message: "Import concluído com sucesso!" });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ error: "Falha na importação" }, { status: 500 });
  } finally {
    await db.$disconnect();
  }
}
