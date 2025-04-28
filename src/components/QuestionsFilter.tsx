// src/app/admin/questions/QuestionsFilter.tsx
"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface QuestionsFilterProps {
  topics: string[];
  years: number[];
  types: string[];
}

export default function QuestionsFilter({
  topics,
  years,
  types,
}: QuestionsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current values from URL
  const search = searchParams.get("search") ?? "";
  const topic = searchParams.get("topic") ?? "";
  const year = searchParams.get("year") ?? "";
  const type = searchParams.get("type") ?? "";

  // Update URL with filters
  const updateFilters = (
    newSearch: string,
    newTopic: string,
    newYear: string,
    newType: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSearch) params.set("search", newSearch);
    else params.delete("search");

    if (newTopic) params.set("topic", newTopic);
    else params.delete("topic");

    if (newYear) params.set("year", newYear);
    else params.delete("year");

    if (newType) params.set("type", newType);
    else params.delete("type");

    // Reset to page 1 when filters change
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <Input
            placeholder="Buscar questões..."
            value={search}
            onChange={(e) => updateFilters(e.target.value, topic, year, type)}
            onKeyDown={(e) =>
              e.key === "Enter" && updateFilters(search, topic, year, type)
            }
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <Select
          value={topic}
          onValueChange={(value) => updateFilters(search, value, year, type)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os temas</SelectItem>
            {topics.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year}
          onValueChange={(value) => updateFilters(search, topic, value, type)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os anos</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={type}
          onValueChange={(value) => updateFilters(search, topic, year, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os tipos</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "teorica-1"
                  ? "Teórica 1"
                  : t === "teorica-2"
                    ? "Teórica 2"
                    : "Teórico prática"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" /> Limpar Filtros
        </Button>
        <Button onClick={() => updateFilters(search, topic, year, type)}>
          <Search className="mr-2 h-4 w-4" /> Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
