// src/app/admin/questions/[id]/edit/QuestionEditForm.tsx
"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { TiptapEditor } from "~/components/TiptapEditor";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

// Schema de validação com Zod
const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "O texto da opção é obrigatório"),
  image: z.string().optional(),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  year: z.number().min(1900, "Ano inválido").max(2100, "Ano inválido"),
  type: z.string().min(1, "O tipo é obrigatório"),
  number: z.number().min(1, "Número inválido"),
  topic: z.string().min(1, "O tema é obrigatório"),
  subtopic: z.string().optional(),
  statement: z.string().min(1, "O enunciado é obrigatório"),
  explanation: z.string().min(1, "A explicação é obrigatória"),
  image: z.string().optional(),
  options: z
    .array(optionSchema)
    .min(2, "A questão deve ter pelo menos 2 opções")
    .refine(
      (options) => options.some((option) => option.isCorrect),
      "Pelo menos uma opção deve ser marcada como correta",
    ),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

// Tipos para os dados recebidos do servidor
interface QuestionEditFormProps {
  questionData: Prisma.QuestionGetPayload<{
    include: { options: true };
  }>; // Tipo da questão do banco de dados
  topicsData: string[];
  isEditing: boolean;
  id: string;
}

export default function QuestionEditForm({
  questionData,
  topicsData,
  isEditing,
  id,
}: QuestionEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Configurar o formulário com react-hook-form e zod
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      year: questionData?.year ?? new Date().getFullYear(),
      type: questionData?.type ?? "Prova Teórica",
      number: questionData?.number ?? 1,
      topic: questionData?.topic ?? "",
      subtopic: questionData?.subtopic ?? "",
      statement: questionData?.statement ?? "",
      explanation: questionData?.explanation ?? "",
      image: questionData?.image ?? "",
      options: questionData?.options?.map((option) => ({
        id: option.id,
        text: option.text ?? "",
        image: option.image ?? "",
        isCorrect: option.isCorrect,
      })) ?? [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    },
  });

  // Configurar o array de opções
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  // Mutations para criar/atualizar questão
  const createQuestion = api.question.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Questão criada",
        description: "A questão foi criada com sucesso.",
      });
      router.push("/admin/questions");
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar questão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuestion = api.question.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Questão atualizada",
        description: "A questão foi atualizada com sucesso.",
      });
      router.push("/admin/questions");
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar questão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Função para lidar com a submissão do formulário
  const onSubmit = (values: QuestionFormValues) => {
    if (isEditing) {
      updateQuestion.mutate({
        id,
        ...values,
      });
    } else {
      createQuestion.mutate(values);
    }
  };

  // Função para adicionar uma nova opção
  const addOption = () => {
    append({ text: "", isCorrect: false, image: "" });
  };

  // Função para remover uma opção
  const removeOption = (index: number) => {
    if (fields.length <= 2) {
      toast({
        title: "Erro",
        description: "A questão deve ter pelo menos 2 opções.",
        variant: "destructive",
      });
      return;
    }

    remove(index);
  };

  // Função para lidar com a marcação de uma opção como correta
  const handleCorrectOptionChange = (index: number, value: boolean) => {
    // Se estiver marcando uma opção como correta, desmarque as outras
    if (value) {
      const currentOptions = form.getValues().options;
      currentOptions.forEach((_, i) => {
        if (i !== index) {
          form.setValue(`options.${i}.isCorrect`, false, {
            shouldValidate: true,
          });
        }
      });
    }

    // Definir o valor para a opção atual
    form.setValue(`options.${index}.isCorrect`, value, {
      shouldValidate: true,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="teorica-1">Teórica 1</SelectItem>
                        <SelectItem value="teorica-2">Teórica 2</SelectItem>
                        <SelectItem value="teorico-pratica">
                          Teórico prática
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tema" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topicsData.map((topic) => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                        <SelectItem value="outro">
                          Outro (adicionar novo)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {field.value === "outro" && (
                      <Input
                        className="mt-2"
                        placeholder="Digite o novo tema"
                        value=""
                        onChange={(e) => form.setValue("topic", e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtopic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtema (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enunciado</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="statement"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TiptapEditor
                      content={field.value}
                      onChange={(content) => {
                        field.onChange(content);
                        // Garantir que o valor seja atualizado no formulário
                        form.setValue("statement", content, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Opção {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`options.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto da opção</FormLabel>
                        <FormControl>
                          <TiptapEditor
                            content={field.value}
                            onChange={(content) => {
                              field.onChange(content);
                              // Garantir que o valor seja atualizado no formulário
                              form.setValue(`options.${index}.text`, content, {
                                shouldValidate: true,
                              });
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`options.${index}.image`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="https://exemplo.com/imagem.jpg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`options.${index}.isCorrect`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              // Chamar diretamente a função de manipulação
                              handleCorrectOptionChange(index, checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel>Resposta correta</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addOption}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Opção
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Explicação</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TiptapEditor
                      content={field.value}
                      onChange={(content) => {
                        field.onChange(content);
                        // Garantir que o valor seja atualizado no formulário
                        form.setValue("explanation", content, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/questions")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting ||
              createQuestion.isPending ||
              updateQuestion.isPending
            }
          >
            {form.formState.isSubmitting ||
            createQuestion.isPending ||
            updateQuestion.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Questão"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
