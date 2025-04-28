"use client";

import { AlertCircle, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { SafeHtmlContent } from "./SafeHtmlContent";

interface QuestionInteractiveProps {
  question?: {
    id: string;
    statement: string;
    images: string[];
    options: {
      id: string;
      text: string | null;
      images: string[];
      isCorrect: boolean;
    }[];
  };
}

export default function QuestionInteractive({
  question,
}: QuestionInteractiveProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>();
  const [showAnswer, setShowAnswer] = useState<boolean>();

  const handleOptionSelect = useCallback((value: string) => {
    setSelectedOption(value);
  }, []);

  const handleConfirmAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  if (!question) {
    return null;
  }

  const isCorrect = selectedOption
    ? (question.options.find((opt) => opt.id === selectedOption)?.isCorrect ??
      false)
    : false;

  return (
    <div className="space-y-4">
      {question.statement && (
        <div className="prose mb-4 dark:prose-invert">
          <SafeHtmlContent content={question.statement} />
        </div>
      )}
      {question.images?.length > 0 && (
        <div className="my-4 flex flex-wrap justify-center gap-4">
          {question.images.map((image, index) => (
            <Image
              key={index}
              src={image}
              alt={`Questão ${index + 1}`}
              width={400}
              height={300}
              className="rounded"
              priority={index === 0}
            />
          ))}
        </div>
      )}

      <RadioGroup
        value={selectedOption ?? ""}
        onValueChange={handleOptionSelect}
        disabled={showAnswer}
      >
        {question.options?.map((option) => (
          <div
            key={option.id}
            className={`flex items-start space-x-2 rounded-lg border p-4 ${
              showAnswer
                ? option.isCorrect
                  ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-950"
                  : selectedOption === option.id
                    ? "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-950"
                    : ""
                : ""
            }`}
          >
            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              {option.text && (
                <div className="prose dark:prose-invert">
                  <SafeHtmlContent content={option.text} />
                </div>
              )}
              {option.images.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-4">
                  {option.images.map((image, imgIndex) => (
                    <Image
                      key={imgIndex}
                      src={image}
                      alt={`Imagem ${imgIndex + 1} da opção`}
                      width={300}
                      height={200}
                      className="rounded"
                      loading={imgIndex === 0 ? "eager" : "lazy"}
                    />
                  ))}
                </div>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {showAnswer && (
        <div className="space-y-4">
          <div
            className={`mt-4 flex items-center justify-center ${
              isCorrect
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {isCorrect ? (
              <Check className="h-6 w-6" />
            ) : (
              <AlertCircle className="h-6 w-6" />
            )}
          </div>

          <div className="mt-4 rounded-lg border bg-muted p-4 text-center">
            <p className="mb-2 font-medium">Quer mais questões como esta?</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Cadastre-se para ter acesso a mais questões e acompanhar seu
              progresso!
            </p>
            <Button asChild>
              <Link href="/login">Cadastrar-se</Link>
            </Button>
          </div>
        </div>
      )}

      {!showAnswer && (
        <div className="mt-4 flex justify-center">
          <Button onClick={handleConfirmAnswer} disabled={!selectedOption}>
            Ver Resposta
          </Button>
        </div>
      )}
    </div>
  );
}
