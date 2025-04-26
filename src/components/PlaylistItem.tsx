"use client";

import { AlertCircle, Check, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

import { type Prisma } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
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
              topics: true;
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
          topics: true;
        };
      };
    };
  }>;
  initialExamMode: boolean;
}

export default function PlaylistItem({
  playlist,
  currentItem,
  initialExamMode,
}: PlaylistItemProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [examMode] = useState(initialExamMode);

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

      // If in exam mode, navigate to next question
      if (examMode) {
        const currentIndex = playlist.items.findIndex(
          (item) => item.id === currentItem.id,
        );
        const nextItem = playlist.items[currentIndex + 1];
        if (nextItem) {
          router.push(`/playlists/${playlist.id}/${nextItem.id}`);
        } else {
          // If it's the last question, go to results
          router.push(`/playlists/${playlist.id}/results`);
        }
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Questão {q.year} – {q.type} – {q.number}
            </CardTitle>
            <CardDescription>
              Tema: {q.topics?.map((t) => t.name).join(", ")}{" "}
              {q.subtopic && `| ${q.subtopic}`}
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          dangerouslySetInnerHTML={{ __html: q.statement }}
          className="prose mb-4"
        />
        <div className="flex justify-center">
          {q.images.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`Questão ${index + 1}`}
              width={400}
              height={300}
              className="rounded"
            />
          ))}
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
                {opt.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`${opt.text!} - Imagem ${index + 1}`}
                    width={400}
                    height={300}
                    className="rounded"
                  />
                ))}
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
  );
}
