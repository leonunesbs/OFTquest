// src/app/admin/questions/[id]/page.tsx
"use client";

import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import Image from "next/image";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

export default function ViewQuestionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;

  const { data: question, isLoading } = api.question.getById.useQuery({
    id,
  });

  const deleteQuestion = api.question.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Questão excluída",
        description: "A questão foi excluída com sucesso.",
      });
      router.push("/admin/questions");
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir questão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir esta questão?")) {
      deleteQuestion.mutate({ id: id });
    }
  };

  if (isLoading) {
    return <div className="container py-10">Carregando questão...</div>;
  }

  if (!question) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Questão não encontrada</CardTitle>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/admin/questions")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para questões
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Visualizar Questão</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/questions")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/questions/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Questão {question.year} - {question.type} - {question.number}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Tema: {question.topic}
            {question.subtopic && ` | Subtema: ${question.subtopic}`}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="prose whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: question.statement }}
          />

          {question.image && (
            <div className="my-4 flex justify-center">
              <Image
                src={`/imagens/${question.image}`}
                alt="Imagem da questão"
                width={400}
                height={300}
                className="rounded-md"
              />
            </div>
          )}

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-bold">Opções:</h3>
            {question.options.map((option, index) => (
              <div
                key={option.id}
                className={`rounded-md border p-4 ${option.isCorrect ? "border-green-500 bg-green-50" : ""}`}
              >
                <div className="flex gap-2">
                  <span
                    className={`font-bold ${option.isCorrect ? "text-green-600" : ""}`}
                  >
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <div className="flex-1">
                    <div
                      className="prose whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{ __html: option.text ?? "" }}
                    />

                    {option.image && (
                      <div className="mt-2">
                        <Image
                          src={option.image}
                          alt="Imagem da opção"
                          width={300}
                          height={200}
                          className="rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="mb-2 text-lg font-bold">Explicação:</h3>
            <div
              className="prose whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: question.explanation }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
