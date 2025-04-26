// src/app/admin/questions/QuestionsTable.tsx
"use client";

import { ChevronLeft, ChevronRight, Edit, Eye, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

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
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  // Mutation para excluir questão
  const deleteQuestion = api.question.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Questão excluída",
        description: "A questão foi excluída com sucesso.",
      });
      // Recarregar a página para atualizar a lista
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir questão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Função para navegar para uma página específica
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

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

    router.push(`${pathname}?${params.toString()}`);
  };

  // Função para confirmar exclusão
  const confirmDelete = (id: string) => {
    setQuestionToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Função para executar exclusão
  const handleDelete = () => {
    if (questionToDelete) {
      deleteQuestion.mutate({ id: questionToDelete });
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    }
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
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
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
                    <div className="flex space-x-2">
                      <Link href={`/admin/questions/${question.id}`}>
                        <Button variant="outline" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/questions/${question.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => confirmDelete(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Lógica para mostrar páginas ao redor da página atual
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
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta questão? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {deleteQuestion.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
