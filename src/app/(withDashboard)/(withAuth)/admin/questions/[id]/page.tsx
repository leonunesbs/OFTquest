// src/app/admin/questions/[id]/page.tsx
"use client";

import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
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
    return <div>Carregando questão...</div>;
  }

  if (!question) {
    return (
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Questão não encontrada</CardTitle>
            <CardDescription>
              A questão que você está procurando não existe ou foi removida.
            </CardDescription>
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
    <div className="">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Visualizar Questão
        </h1>
        <p className="text-muted-foreground">
          Detalhes e informações da questão {question.year} - {question.type} -{" "}
          {question.number}
        </p>
      </div>

      <div className="mb-6 flex justify-end gap-2">
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Questão {question.year} - {question.type} - {question.number}
          </CardTitle>
          <CardDescription>
            Tema: {question.topics?.map((t) => t.name).join(", ")}
            {question.subtopic && ` | Subtema: ${question.subtopic}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="prose whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: question.statement }}
          />

          {question.images.length > 0 && (
            <div className="my-4 flex flex-wrap justify-center gap-4">
              {question.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`Imagem ${index + 1} da questão`}
                  width={400}
                  height={300}
                  className="rounded-md"
                />
              ))}
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

                    {option.images.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-4">
                        {option.images.map((image, imgIndex) => (
                          <Image
                            key={imgIndex}
                            src={image}
                            alt={`Imagem ${imgIndex + 1} da opção`}
                            width={300}
                            height={200}
                            className="rounded-md"
                          />
                        ))}
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
