"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import { setExamMode } from "~/app/(withAuth)/(withDashboard)/playlists/[id]/[playlistItemId]/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Switch } from "~/components/ui/switch";

import { type Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

interface PlaylistItemProps {
  playlist: Prisma.PlaylistGetPayload<{
    include: {
      items: {
        include: {
          question: {
            include: {
              options: true;
            };
          };
        };
      };
    };
  }>;
  currentItem: Prisma.PlaylistItemGetPayload<{
    include: {
      question: {
        include: {
          options: true;
        };
      };
    };
  }>;
  currentIndex: number;
  initialExamMode: boolean;
}

export default function PlaylistItem({
  playlist,
  currentItem,
  currentIndex,
  initialExamMode,
}: PlaylistItemProps) {
  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [examMode, setExamModeState] = useState(initialExamMode);

  const handleExamModeChange = async (checked: boolean) => {
    setExamModeState(checked);
    await setExamMode(checked);
  };

  // State for answer
  const [selectedOption, setSelectedOption] = useState<string | null>(
    currentItem.selectedOptionId ?? null,
  );
  const [answered, setAnswered] = useState(!!currentItem.selectedOptionId);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(
    currentItem.selectedOptionId
      ? currentItem.question.options.some(
          (o) => o.id === currentItem.selectedOptionId && o.isCorrect,
        )
      : null,
  );

  // Center current question in scroll view
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const currentButton = container.querySelector(
      `[data-index="${currentIndex}"]`,
    );
    if (!currentButton) return;

    const containerWidth = container.clientWidth;
    const buttonLeft = (currentButton as HTMLElement).offsetLeft;
    const buttonWidth = (currentButton as HTMLElement).offsetWidth;

    const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;
    container.scrollLeft = Math.max(0, scrollLeft);
  }, [currentIndex]);

  const answerMutation = api.playlist.answerQuestion.useMutation({
    onSuccess({ isCorrect }) {
      setIsCorrect(isCorrect);
      setAnswered(true);

      if (isCorrect) {
        toast({
          title: "Resposta correta!",
          variant: "default",
          duration: 2000,
        });
      }
    },
    onError(error) {
      toast({
        title: "Erro ao responder",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const items = playlist.items;
  const q = currentItem.question;
  const progress = ((currentIndex + 1) / items.length) * 100;
  const answeredCount = items.filter((it) => it.selectedOptionId).length;

  const confirmAnswer = () => {
    if (selectedOption && !answered) {
      answerMutation.mutate({
        playlistItemId: currentItem.id,
        selectedOptionId: selectedOption,
      });
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="exam-mode">Modo Prova</Label>
          <Switch
            id="exam-mode"
            checked={examMode}
            onCheckedChange={handleExamModeChange}
          />
        </div>
      </div>
      <Progress value={progress} className="mb-6 h-2" />

      <div className="mb-4 flex items-center justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationFirst
                href={`/playlists/${playlist.id}/${items[0]?.id}`}
                className={
                  currentIndex <= 0 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                href={`/playlists/${playlist.id}/${items[currentIndex - 1]?.id}`}
                className={
                  currentIndex <= 0 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {items
              .slice(
                Math.max(0, currentIndex - 2),
                Math.min(items.length, currentIndex + 3),
              )
              .map((it, idx) => {
                const actualIndex = Math.max(0, currentIndex - 2) + idx;
                const done = Boolean(it.selectedOptionId);
                const correct =
                  done &&
                  it.question.options.some(
                    (o) => o.id === it.selectedOptionId && o.isCorrect,
                  );
                return (
                  <PaginationItem key={it.id}>
                    <PaginationLink
                      href={`/playlists/${playlist.id}/${it.id}`}
                      isActive={actualIndex === currentIndex}
                    >
                      {actualIndex + 1}
                      {done && !examMode && (
                        <div
                          className={
                            correct ? "text-green-600" : "text-red-600"
                          }
                        >
                          {correct ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

            <PaginationItem>
              <PaginationNext
                href={`/playlists/${playlist.id}/${items[currentIndex + 1]?.id}`}
                className={
                  currentIndex >= items.length - 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast
                href={`/playlists/${playlist.id}/${items[items.length - 1]?.id}`}
                className={
                  currentIndex >= items.length - 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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
          {answered && !examMode && (
            <div className={isCorrect ? "text-green-600" : "text-red-600"}>
              {isCorrect ? (
                <Check className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            dangerouslySetInnerHTML={{ __html: q.statement }}
            className="prose mb-4"
          />
          <div className="flex justify-center">
            {q.image && (
              <Image
                src={`/imagens/${q.image}`}
                alt="Questão"
                width={400}
                height={300}
                className="rounded"
              />
            )}
          </div>
          <RadioGroup
            value={selectedOption ?? ""}
            onValueChange={setSelectedOption}
            disabled={answered}
          >
            {q.options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => !answered && setSelectedOption(opt.id)}
                className={
                  `flex items-start space-x-2 rounded-md border p-4 ` +
                  (!answered ? "cursor-pointer" : "") +
                  (answered && !examMode && opt.isCorrect
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950"
                    : answered &&
                        !examMode &&
                        selectedOption === opt.id &&
                        !opt.isCorrect
                      ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950"
                      : "")
                }
              >
                <RadioGroupItem value={opt.id} id={opt.id} />
                <Label
                  htmlFor={opt.id}
                  className={
                    answered && !examMode && opt.isCorrect ? "font-bold" : ""
                  }
                >
                  <span dangerouslySetInnerHTML={{ __html: opt.text! }} />
                  {opt.image && (
                    <Image
                      src={`/imagens/${opt.image}`}
                      alt={opt.text!}
                      width={400}
                      height={300}
                      className="rounded"
                    />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {answered && !examMode && (
            <div className="mt-4 rounded bg-gray-50 p-4 dark:bg-gray-800">
              <h3 className="mb-2 font-bold">Explicação</h3>
              <div
                dangerouslySetInnerHTML={{ __html: q.explanation }}
                className="prose dark:prose-invert"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
            <Button
              onClick={confirmAnswer}
              disabled={answered || !selectedOption || answerMutation.isPending}
            >
              {answerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
            <Link href={`/playlists/${playlist.id}/results`} passHref>
              <Button variant="outline" disabled={answeredCount === 0}>
                Finalizar
              </Button>
            </Link>
            <Link href={`/admin/questions/${q.id}`} passHref>
              <Button variant="outline">Ver no Admin</Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
