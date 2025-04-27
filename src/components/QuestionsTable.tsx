// src/app/admin/questions/QuestionsTable.tsx
"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { Eye } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

interface Question {
  id: string;
  year: number;
  type: string;
  number: number;
  topics: { name: string }[];
  subtopic: string | null;
  statement: string;
  options: { isCorrect: boolean }[];
}

interface QuestionsTableProps {
  questions: Question[];
  currentPage: number;
  totalPages: number;
  currentFilters: {
    search?: string;
    topic?: string;
    year?: number;
    type?: string;
    limit?: number;
  };
}

export default function QuestionsTable({
  questions,
  currentPage,
  totalPages,
  currentFilters,
}: QuestionsTableProps) {
  const pathname = usePathname();

  // Função para gerar href com os parâmetros corretos
  const getPageHref = (page: number) => {
    const params = new URLSearchParams();

    // Manter os filtros atuais
    if (currentFilters.search) params.set("search", currentFilters.search);
    if (currentFilters.topic) params.set("topic", currentFilters.topic);
    if (currentFilters.year) params.set("year", currentFilters.year.toString());
    if (currentFilters.type) params.set("type", currentFilters.type);
    if (currentFilters.limit)
      params.set("limit", currentFilters.limit.toString());

    // Atualizar a página
    params.set("page", page.toString());

    return `${pathname}?${params.toString()}`;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Ano</TableHead>
              <TableHead className="w-[150px]">Tipo</TableHead>
              <TableHead className="w-[80px]">Número</TableHead>
              <TableHead className="w-[200px]">Tema</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  Nenhuma questão encontrada.
                </TableCell>
              </TableRow>
            ) : (
              questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>{question.year}</TableCell>
                  <TableCell>
                    {question.type === "teorica-1"
                      ? "Teórica 1"
                      : question.type === "teorica-2"
                        ? "Teórica 2"
                        : "Teórico prática"}
                  </TableCell>
                  <TableCell>{question.number}</TableCell>
                  <TableCell>
                    <div>
                      {question.topics.map((topic) => (
                        <Badge
                          key={topic.name}
                          variant="outline"
                          className="mr-1"
                        >
                          {topic.name}
                        </Badge>
                      ))}
                      {question.subtopic && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          {question.subtopic}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link href={`/questions/${question.id}`}>
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={getPageHref(currentPage - 1)}
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href={getPageHref(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href={getPageHref(currentPage + 1)}
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
