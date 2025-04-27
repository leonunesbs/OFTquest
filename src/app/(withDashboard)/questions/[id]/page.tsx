import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QuestionInteractive from "~/components/QuestionInteractive";
import { QuestionNavigationForm } from "~/components/QuestionNavigationForm";
import QuestionPagination from "~/components/QuestionPagination";
import { Button } from "~/components/ui/button";
import { api, HydrateClient } from "~/trpc/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const question = await api.question.getByIdPublic({ id });

  if (!question) {
    return {
      title: "Questão não encontrada",
      description:
        "A questão que você está procurando não existe ou foi removida.",
    };
  }

  return {
    title: `Questão ${question.year} – ${question.type} – ${question.number}`,
    description: `Questão ${question.number} do ${question.type} de ${question.year}. Tema: ${question.topics?.map((t) => t.name).join(", ")} ${question.subtopic ? `| ${question.subtopic}` : ""}`,
    openGraph: {
      title: `Questão ${question.year} – ${question.type} – ${question.number}`,
      description: `Questão ${question.number} do ${question.type} de ${question.year}. Tema: ${question.topics?.map((t) => t.name).join(", ")} ${question.subtopic ? `| ${question.subtopic}` : ""}`,
      type: "article",
    },
  };
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await api.question.getByIdPublic({ id });

  if (!question) {
    notFound();
  }

  // Get all questions for the current year and type
  const questions = await api.question.getAllByYearAndType({
    year: question.year,
    type: question.type,
  });

  return (
    <HydrateClient>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Navegar para outra prova</CardTitle>
            <CardDescription>
              Selecione o ano e tipo de prova para navegar para a primeira
              questão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionNavigationForm
              currentYear={question.year}
              currentType={question.type}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <QuestionPagination
              year={question.year}
              type={question.type}
              currentNumber={question.number}
              questions={questions}
              baseUrl="/questions"
            />
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  Questão {question.year} – {question.type} – {question.number}
                </CardTitle>
                <CardDescription>
                  Tema: {question.topics?.map((t) => t.name).join(", ")}{" "}
                  {question.subtopic && `| ${question.subtopic}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <QuestionInteractive question={question} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <nav aria-label="Navegação entre questões" className="flex gap-2">
              <Button variant="outline" asChild>
                <Link
                  href="/questions"
                  aria-label="Voltar para a lista de questões"
                >
                  Voltar
                </Link>
              </Button>
            </nav>
          </CardFooter>
        </Card>
      </div>
    </HydrateClient>
  );
}
