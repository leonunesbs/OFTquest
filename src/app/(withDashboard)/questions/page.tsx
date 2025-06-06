import { type Prisma } from "@prisma/client";
import QuestionInteractive from "~/components/QuestionInteractive";
import QuestionsFilter from "~/components/QuestionsFilter";
import QuestionsTable from "~/components/QuestionsTable";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { db } from "~/server/db";
import { HydrateClient } from "~/trpc/server";

type SearchParams = Promise<{
  page?: string | string[];
  limit?: string | string[];
  search?: string | string[];
  topic?: string | string[];
  year?: string | string[];
  type?: string | string[];
}>;

type FilterParams = {
  page: number;
  limit: number;
  search: string;
  topic: string;
  year?: number;
  type: string;
};

async function parseSearchParams(
  searchParams: SearchParams,
): Promise<FilterParams> {
  const params = await searchParams;
  return {
    page: params.page ? Number(params.page) : 1,
    limit: params.limit ? Number(params.limit) : 10,
    search: params.search?.toString() ?? "",
    topic: params.topic?.toString() ?? "",
    year: params.year ? Number(params.year) : undefined,
    type: params.type?.toString() ?? "",
  };
}

function buildWhereClause({
  search,
  topic,
  year,
  type,
}: Omit<FilterParams, "page" | "limit">): Prisma.QuestionWhereInput {
  const where: Prisma.QuestionWhereInput = {};

  if (search) {
    where.OR = [
      { statement: { contains: search, mode: "insensitive" } },
      { topics: { some: { name: { contains: search, mode: "insensitive" } } } },
      { subtopic: { contains: search, mode: "insensitive" } },
    ];
  }

  if (topic) {
    where.topics = { some: { name: topic } };
  }

  if (year) {
    where.year = year;
  }

  if (type) {
    where.type = type;
  }

  return where;
}

async function getQuestionsData(searchParams: SearchParams) {
  "use server";
  const filters = await parseSearchParams(searchParams);
  const where = buildWhereClause(filters);

  const [questions, totalQuestions, topics, years, types, randomQuestion] =
    await Promise.all([
      db.question.findMany({
        where,
        orderBy: [{ year: "desc" }, { type: "asc" }, { number: "asc" }],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          options: {
            select: {
              isCorrect: true,
            },
          },
          topics: true,
        },
      }),
      db.question.count({ where }),
      db.topic
        .findMany({
          select: { name: true },
        })
        .then((topics) => topics.map((t) => t.name)),
      db.question
        .groupBy({
          by: ["year"],
        })
        .then((years) => years.map((y) => y.year).sort((a, b) => b - a)),
      db.question
        .groupBy({
          by: ["type"],
        })
        .then((types) => types.map((t) => t.type)),
      (async () => {
        const totalQuestionsWithImages = await db.question.count({
          where: {
            images: {
              isEmpty: false,
            },
          },
        });

        const randomOffset = Math.floor(
          Math.random() * totalQuestionsWithImages,
        );

        return db.question.findFirst({
          where: {
            images: {
              isEmpty: false,
            },
          },
          orderBy: {
            id: "asc",
          },
          skip: randomOffset,
          include: {
            options: true,
            topics: true,
          },
        });
      })(),
    ]);

  return {
    questions,
    totalPages: Math.ceil(totalQuestions / filters.limit),
    topics,
    years,
    types,
    randomQuestion,
    filters,
  };
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const {
    questions,
    totalPages,
    topics,
    years,
    types,
    randomQuestion,
    filters,
  } = await getQuestionsData(searchParams);

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Questões</h1>
        <p className="text-muted-foreground">
          Pratique com questões de provas anteriores do CBO
        </p>
      </div>

      <HydrateClient>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Questão Aleatória</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionInteractive question={randomQuestion!} />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionsFilter topics={topics} years={years} types={types} />
          </CardContent>
        </Card>

        <QuestionsTable
          questions={questions}
          currentPage={filters.page}
          totalPages={totalPages}
          currentFilters={filters}
        />
      </HydrateClient>
    </div>
  );
}
