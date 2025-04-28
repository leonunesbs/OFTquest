import { type Prisma } from "@prisma/client";
import QuestionInteractive from "~/components/QuestionInteractive";
import QuestionsFilter from "~/components/QuestionsFilter";
import QuestionsTable from "~/components/QuestionsTable";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { db } from "~/server/db";
import { HydrateClient } from "~/trpc/server";

type SearchParams = {
  page?: string | string[];
  limit?: string | string[];
  search?: string | string[];
  topic?: string | string[];
  year?: string | string[];
  type?: string | string[];
};

type FilterParams = {
  page: number;
  limit: number;
  search: string;
  topic: string;
  year?: number;
  type: string;
};

function parseSearchParams(searchParams: SearchParams): FilterParams {
  return {
    page: searchParams.page ? Number(searchParams.page) : 1,
    limit: searchParams.limit ? Number(searchParams.limit) : 10,
    search: searchParams.search?.toString() ?? "",
    topic: searchParams.topic?.toString() ?? "",
    year: searchParams.year ? Number(searchParams.year) : undefined,
    type: searchParams.type?.toString() ?? "",
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

async function fetchQuestionsData(
  where: Prisma.QuestionWhereInput,
  page: number,
  limit: number,
) {
  const [questions, totalQuestions] = await Promise.all([
    db.question.findMany({
      where,
      orderBy: [{ year: "desc" }, { type: "asc" }, { number: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
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
  ]);

  return {
    questions,
    totalQuestions,
    totalPages: Math.ceil(totalQuestions / limit),
  };
}

async function fetchFilterOptions() {
  const [topics, years, types] = await Promise.all([
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
  ]);

  return { topics, years, types };
}

async function fetchRandomQuestion(totalQuestions: number) {
  return db.question.findFirst({
    where: {},
    orderBy: {
      id: "asc",
    },
    skip: Math.floor(Math.random() * totalQuestions),
    include: {
      options: true,
      topics: true,
    },
  });
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = parseSearchParams(await searchParams);
  const where = buildWhereClause(filters);

  const [{ questions, totalPages }, { topics, years, types }, randomQuestion] =
    await Promise.all([
      fetchQuestionsData(where, filters.page, filters.limit),
      fetchFilterOptions(),
      fetchRandomQuestion(await db.question.count({ where })),
    ]);

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Questões</h1>
        <p className="text-muted-foreground">
          Pratique com questões de provas anteriores do CBO
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Questão Aleatória</CardTitle>
        </CardHeader>
        <CardContent>
          <HydrateClient>
            <QuestionInteractive question={randomQuestion!} />
          </HydrateClient>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <HydrateClient>
            <QuestionsFilter topics={topics} years={years} types={types} />
          </HydrateClient>
        </CardContent>
      </Card>
      <HydrateClient>
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
