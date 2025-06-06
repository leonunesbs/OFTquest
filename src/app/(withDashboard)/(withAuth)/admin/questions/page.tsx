import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import { type Prisma } from "@prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";
import QuestionsFilter from "~/components/QuestionsFilter";
import QuestionsTable from "~/components/QuestionsTable";
import { Button } from "~/components/ui/button";
import { db } from "~/server/db";

// Função para obter os parâmetros de busca da URL
function getSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const limit = searchParams.limit ? Number(searchParams.limit) : 10;
  const search = searchParams.search?.toString() ?? "";
  const topic = searchParams.topic?.toString() ?? "";
  const year = searchParams.year ? Number(searchParams.year) : undefined;
  const type = searchParams.type?.toString() ?? "";

  return { page, limit, search, topic, year, type };
}

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page, limit, search, topic, year, type } = getSearchParams(
    await searchParams,
  );

  // Construir a query com os filtros
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

  // Buscar questões com ordenação por ano, tipo e número
  const questions = await db.question.findMany({
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
  });

  // Contar o total de questões para paginação
  const totalQuestions = await db.question.count({ where });
  const totalPages = Math.ceil(totalQuestions / limit);

  // Buscar temas para o filtro
  const topics = await db.topic
    .findMany({
      select: { name: true },
    })
    .then((topics) => topics.map((t) => t.name));

  // Buscar anos para o filtro
  const years = await db.question
    .groupBy({
      by: ["year"],
    })
    .then((years) => years.map((y) => y.year).sort((a, b) => b - a));

  // Buscar tipos para o filtro
  const types = await db.question
    .groupBy({
      by: ["type"],
    })
    .then((types) => types.map((t) => t.type));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Questões</h1>
        <Link href="/admin/questions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Questão
          </Button>
        </Link>
      </div>

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
        currentPage={page}
        totalPages={totalPages}
        currentFilters={{ search, topic, year, type, limit }}
      />
    </div>
  );
}
