"use client";

import { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const formSchema = z.object({
  year: z.number().min(2006, "Ano inválido").max(2024, "Ano inválido"),
  type: z.string().min(1, "O tipo é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionNavigationFormProps {
  currentYear?: number;
  currentType?: string;
}

export function QuestionNavigationForm({
  currentYear,
  currentType,
}: QuestionNavigationFormProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: currentYear ?? new Date().getFullYear(),
      type: currentType ?? "teorica-1",
    },
    mode: "onChange",
  });

  const [shouldFetch, setShouldFetch] = useState(false);
  const [queryParams, setQueryParams] = useState<FormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: firstQuestion, isLoading } =
    api.question.getFirstQuestion.useQuery(
      queryParams ?? { year: 0, type: "" },
      {
        enabled: shouldFetch && queryParams !== null,
      },
    );

  const onSubmit = (values: FormValues) => {
    console.log("Form submitted with values:", values);
    setError(null);
    setQueryParams(values);
    setShouldFetch(true);
  };

  useEffect(() => {
    console.log("shouldFetch changed:", shouldFetch);
    console.log("firstQuestion:", firstQuestion);
    if (firstQuestion) {
      console.log("Navigating to:", `/questions/${firstQuestion.id}`);
      router.push(`/questions/${firstQuestion.id}`);
    } else if (shouldFetch && firstQuestion === null) {
      setError("Nenhuma questão encontrada para o ano e tipo selecionados.");
      setShouldFetch(false);
    }
  }, [firstQuestion, router, shouldFetch]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={`Ano ${form.getValues().year}`}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 19 }, (_, i) => 2006 + i).map(
                      (year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
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
                      <SelectValue
                        placeholder={`Tipo ${form.getValues().type}`}
                      />
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
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? "Carregando..." : "Ir para primeira questão"}
        </Button>
      </form>
    </Form>
  );
}
