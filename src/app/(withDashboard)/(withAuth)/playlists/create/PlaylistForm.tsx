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
import { Loader2, Lock, Sparkles } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
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
  mode: z.enum(["automated", "custom"]),
  selectedTopics: z.array(z.string()).optional(),
  topicsCount: z
    .number()
    .min(1, "Mínimo de 1 tema")
    .max(10, "Máximo de 10 temas")
    .optional(),
  years: z.array(z.number()).min(1, "Selecione pelo menos um ano de questões"),
  studyTime: z
    .number()
    .min(30, "Mínimo de 30 minutos")
    .max(240, "Máximo de 4 horas"),
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

  const { data: topics } = api.playlist.getAvailableTopics.useQuery();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "automated",
      selectedTopics: [],
      topicsCount: 3,
      years: [],
      studyTime: 60,
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
    const questionsCount = Math.floor(vals.studyTime / 3);
    generate.mutate({
      mode: vals.mode,
      selectedTopics: vals.mode === "custom" ? vals.selectedTopics : undefined,
      topicsCount: vals.mode === "automated" ? vals.topicsCount : undefined,
      years: vals.years,
      questionsCount,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* modo de geração */}
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modo de Geração</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    className={`relative cursor-pointer p-4 transition-all ${
                      field.value === "automated"
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => field.onChange("automated")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="font-medium">Automático</span>
                      </div>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Gera uma playlist inteligente baseada no seu desempenho e
                      nos temas mais relevantes.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        IA
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Premium
                      </span>
                    </div>
                  </Card>

                  <Card
                    className={`cursor-pointer p-4 transition-all ${
                      field.value === "custom"
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => field.onChange("custom")}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Personalizado</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Selecione manualmente os temas que deseja incluir na
                      playlist.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Gratuito
                      </span>
                    </div>
                  </Card>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* temas (apenas no modo personalizado) */}
        {form.watch("mode") === "custom" && (
          <FormField
            control={form.control}
            name="selectedTopics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temas</FormLabel>
                <FormControl>
                  <div className="grid max-h-64 grid-cols-2 gap-2 overflow-auto">
                    {topics?.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`topic-${topic.id}`}
                          checked={field.value?.includes(topic.name)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([
                                ...(field.value ?? []),
                                topic.name,
                              ]);
                            } else {
                              field.onChange(
                                field.value?.filter((t) => t !== topic.name) ??
                                  [],
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`topic-${topic.id}`}>
                          {topic.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormDescription>
                  Selecione os temas que deseja incluir na playlist.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* temas (apenas no modo automático) */}
        {form.watch("mode") === "automated" && (
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
                      max={10}
                      step={1}
                      value={[field.value ?? 3]}
                      onValueChange={(v) => field.onChange(v[0])}
                    />
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">1</span>
                      <span className="text-sm font-medium">
                        {field.value} temas
                      </span>
                      <span className="text-sm text-muted-foreground">10</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Número de temas a serem incluídos na playlist.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* anos */}
        <FormField
          control={form.control}
          name="years"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anos das Questões</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all-years"
                      checked={field.value.length === availableYears.length}
                      onCheckedChange={(checked) => {
                        field.onChange(checked ? [...availableYears] : []);
                      }}
                    />
                    <Label htmlFor="select-all-years">Selecionar todos</Label>
                  </div>
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
                </div>
              </FormControl>
              <FormDescription>
                Filtre questões pelo(s) ano(s) selecionado(s).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* tempo de estudo */}
        <FormField
          control={form.control}
          name="studyTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tempo de Estudo</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={30}
                    max={240}
                    step={30}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      30 min
                    </span>
                    <span className="text-sm font-medium">
                      {field.value} min
                    </span>
                    <span className="text-sm text-muted-foreground">
                      4 horas
                    </span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Tempo disponível para estudo. A quantidade de questões será
                ajustada automaticamente.
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
