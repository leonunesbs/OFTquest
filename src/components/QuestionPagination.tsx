"use client";

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

interface Question {
  id: string;
  number: number;
}

interface QuestionPaginationProps {
  year: number;
  type: string;
  currentNumber: number;
  questions: Question[];
  baseUrl: string;
}

export default function QuestionPagination({
  year,
  type,
  currentNumber,
  questions,
  baseUrl,
}: QuestionPaginationProps) {
  const currentIndex = questions.findIndex((q) => q.number === currentNumber);
  const firstQuestion = questions[0];
  const lastQuestion = questions[questions.length - 1];
  const previousQuestion = questions[currentIndex - 1];
  const nextQuestion = questions[currentIndex + 1];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {year} – {type}
        </h2>
      </div>

      <div className="flex items-center justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationFirst
                href={firstQuestion ? `${baseUrl}/${firstQuestion.id}` : "#"}
                className={
                  !firstQuestion ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                href={
                  previousQuestion ? `${baseUrl}/${previousQuestion.id}` : "#"
                }
                className={
                  !previousQuestion ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {questions
              .slice(
                Math.max(0, currentIndex - 2),
                Math.min(questions.length, currentIndex + 3),
              )
              .map((question) => (
                <PaginationItem key={question.id}>
                  <PaginationLink
                    href={`${baseUrl}/${question.id}`}
                    isActive={question.number === currentNumber}
                    className={
                      question.number === currentNumber ? "rounded border" : ""
                    }
                  >
                    {question.number}
                  </PaginationLink>
                </PaginationItem>
              ))}

            <PaginationItem>
              <PaginationNext
                href={nextQuestion ? `${baseUrl}/${nextQuestion.id}` : "#"}
                className={
                  !nextQuestion ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast
                href={lastQuestion ? `${baseUrl}/${lastQuestion.id}` : "#"}
                className={
                  !lastQuestion ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
