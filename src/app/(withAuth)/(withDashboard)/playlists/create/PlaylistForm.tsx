// src/app/playlists/create/PlaylistsForm.tsx
"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Loader2 } from "lucide-react";
import { Slider } from "~/components/ui/slider";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const availableYears = Array.from(
  { length: 2025 - 2006 + 1 },
  (_, i) => 2006 + i,
);

const formSchema = z.object({
  topicsCount: z
    .number()
    .min(1, "Selecione pelo menos 1 tema")
    .max(20, "Máximo de 20 temas"),
  questionsCount: z
    .number()
    .min(5, "Mínimo de 5 questões")
    .max(100, "Máximo de 100 questões"),
  years: z.array(z.number()).min(1, "Selecione pelo menos um ano de questões"),
});
type FormValues = z.infer<typeof formSchema>;

export default function PlaylistForm({
  availableYears,
}: {
  availableYears: number[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topicsCount: 5,
      questionsCount: 20,
      years: [],
    },
  });

  const generate = api.playlist.generate.useMutation({
    onSuccess: (data) => {
      setIsSubmitting(false);
      toast({
        title: "Playlist criada com sucesso!",
        description: `${data.items.length} questões foram adicionadas.`,
      });
      router.push(`/playlists/${data.id}`);
    },
    onError: (err) => {
      setIsSubmitting(false);
      toast({
        title: "Erro ao criar playlist",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(vals: FormValues) {
    setIsSubmitting(true);
    generate.mutate({
      topicsCount: vals.topicsCount,
      questionsCount: vals.questionsCount,
      years: vals.years,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* temas */}
        <FormField
          control={form.control}
          name="topicsCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Temas</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={1}
                    max={20}
                    step={1}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">1</span>
                    <span className="text-sm font-medium">
                      {field.value} temas
                    </span>
                    <span className="text-sm text-muted-foreground">20</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Quantidade de temas diferentes na playlist.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* questões */}
        <FormField
          control={form.control}
          name="questionsCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Questões</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={5}
                    max={100}
                    step={5}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">5</span>
                    <span className="text-sm font-medium">
                      {field.value} questões
                    </span>
                    <span className="text-sm text-muted-foreground">100</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>Total de questões na playlist.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* anos */}
        <FormField
          control={form.control}
          name="years"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anos das Questões</FormLabel>
              <FormControl>
                <div className="grid max-h-64 grid-cols-4 gap-2 overflow-auto">
                  {availableYears.map((year) => (
                    <div key={year} className="flex items-center space-x-2">
                      <Checkbox
                        id={`year-${year}`}
                        checked={field.value.includes(year)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, year]);
                          } else {
                            field.onChange(
                              field.value.filter((y) => y !== year),
                            );
                          }
                        }}
                      />
                      <Label htmlFor={`year-${year}`}>{year}</Label>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormDescription>
                Filtre questões pelo(s) ano(s) selecionado(s).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* submit */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando playlist...
            </>
          ) : (
            "Gerar Playlist"
          )}
        </Button>
      </form>
    </Form>
  );
}
