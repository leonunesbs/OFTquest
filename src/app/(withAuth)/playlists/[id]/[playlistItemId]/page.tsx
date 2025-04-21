// src/app/playlists/[id]/[playlistItemId]/page.tsx
"use client";

import { AlertCircle, Check, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

export default function PlaylistItemPage() {
  const router = useRouter();
  const params = useParams();
  const { id, playlistItemId } = params as {
    id: string;
    playlistItemId: string;
  };
  const { data: playlist, isLoading } = api.playlist.getById.useQuery(
    { id },
    { enabled: !!id },
  );
  const { toast } = useToast();

  // Simplified items array and current index
  const items = playlist?.items ?? [];
  const currentIndex = items.findIndex((item) => item.id === playlistItemId);
  const item = items[currentIndex];

  // State for answer
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const answerMutation = api.playlist.answerQuestion.useMutation({
    onSuccess({ isCorrect }) {
      setIsCorrect(isCorrect);
      setAnswered(true);

      toast({
        title: isCorrect ? "Resposta correta!" : "Resposta incorreta",
        description: isCorrect ? "Parabéns!" : "Tente novamente",
        variant: isCorrect ? "default" : "destructive",
      });
    },
    onError(error) {
      toast({
        title: "Erro ao responder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // sync selection when question changes
  useEffect(() => {
    if (!item) return;
    const sel = item.selectedOptionId ?? null;
    setSelectedOption(sel);
    setAnswered(!!sel);
    if (sel) {
      setIsCorrect(
        item.question.options.some((o) => o.id === sel && o.isCorrect),
      );
    } else {
      setIsCorrect(null);
    }
  }, [item]);

  if (isLoading || !item) {
    return <div className="container py-10">Carregando questão...</div>;
  }

  const q = item.question;
  const progress = ((currentIndex + 1) / items.length) * 100;
  const answeredCount = items.filter((it) => it.selectedOptionId).length;

  const navigateTo = (idx: number) => {
    const next = items[idx];
    if (next) router.replace(`/playlists/${id}/${next.id}`);
  };

  const confirmAnswer = () => {
    if (selectedOption && !answered) {
      answerMutation.mutate({
        playlistItemId: item.id,
        selectedOptionId: selectedOption,
      });
    }
  };

  return (
    <div className="container py-10">
      <h1 className="mb-4 text-2xl font-bold">{playlist?.name}</h1>
      <Progress value={progress} className="mb-6 h-2" />

      <div className="mb-4 flex flex-wrap gap-2">
        {items.map((it, idx) => {
          const done = Boolean(it.selectedOptionId);
          const correct =
            done &&
            it.question.options.some(
              (o) => o.id === it.selectedOptionId && o.isCorrect,
            );
          const variant =
            idx === currentIndex
              ? "default"
              : done
                ? correct
                  ? "secondary"
                  : "destructive"
                : "outline";
          return (
            <Link key={it.id} href={`/playlists/${id}/${it.id}`}>
              <Button variant={variant} size="sm">
                {idx + 1}
              </Button>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Questão {q.year} – {q.type} – {q.number}
            </CardTitle>
            <CardDescription>
              Tema: {q.topic} {q.subtopic && `| ${q.subtopic}`}
            </CardDescription>
          </div>
          {answered && (
            <div className={isCorrect ? "text-green-600" : "text-red-600"}>
              {isCorrect ? (
                <Check className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div
            dangerouslySetInnerHTML={{ __html: q.statement }}
            className="prose mb-4"
          />
          {q.image && (
            <Image
              src={`/imagens/${q.image}`}
              alt="Questão"
              width={400}
              height={300}
              className="rounded"
            />
          )}
          <RadioGroup
            value={selectedOption ?? ""}
            onValueChange={setSelectedOption}
            disabled={answered}
          >
            {q.options.map((opt) => (
              <div
                key={opt.id}
                className={
                  `flex items-start space-x-2 rounded-md border p-4 ` +
                  (answered && opt.isCorrect
                    ? "border-green-300 bg-green-50"
                    : answered && selectedOption === opt.id && !opt.isCorrect
                      ? "border-red-300 bg-red-50"
                      : "")
                }
              >
                <RadioGroupItem value={opt.id} id={opt.id} />
                <Label
                  htmlFor={opt.id}
                  className={answered && opt.isCorrect ? "font-bold" : ""}
                >
                  <span dangerouslySetInnerHTML={{ __html: opt.text! }} />
                </Label>
              </div>
            ))}
          </RadioGroup>
          {answered && (
            <div className="mt-4 rounded bg-gray-50 p-4">
              <h3 className="mb-2 font-bold">Explicação</h3>
              <div
                dangerouslySetInnerHTML={{ __html: q.explanation }}
                className="prose"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => navigateTo(currentIndex - 1)}
            disabled={currentIndex <= 0}
            variant="outline"
          >
            <ChevronLeft className="mr-2" /> Anterior
          </Button>
          <div className="space-x-2">
            <Button
              onClick={confirmAnswer}
              disabled={answered || !selectedOption}
            >
              Confirmar
            </Button>
            <Button onClick={() => navigateTo(currentIndex + 1)}>
              Próxima
            </Button>
            <Link href={`/playlists/${id}/results`}>
              <Button variant="secondary" disabled={answeredCount === 0}>
                Finalizar
              </Button>
            </Link>
            <Link href={`/admin/questions/${q.id}`}>
              <Button variant="outline">Ver no Admin</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
