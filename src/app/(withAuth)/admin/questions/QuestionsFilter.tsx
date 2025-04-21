// src/app/admin/questions/QuestionsFilter.tsx
"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  currentFilters: {
    search?: string;
    topic?: string;
    year?: number;
    type?: string;
  };
}

export default function QuestionsFilter({
  topics,
  years,
  types,
  currentFilters,
}: QuestionsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Estado local para os filtros
  const [search, setSearch] = useState(currentFilters.search ?? "");
  const [topic, setTopic] = useState(currentFilters.topic ?? "");
  const [year, setYear] = useState(currentFilters.year?.toString() ?? "");
  const [type, setType] = useState(currentFilters.type ?? "");

  // Atualizar a URL com os filtros
  const updateFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (topic) params.set("topic", topic);
    if (year) params.set("year", year);
    if (type) params.set("type", type);

    // Resetar para a página 1 quando os filtros mudam
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearch("");
    setTopic("");
    setYear("");
    setType("");

    router.push(pathname);
  };

  // Sincronizar estado local com os filtros da URL ao montar o componente
  useEffect(() => {
    setSearch(currentFilters.search ?? "");
    setTopic(currentFilters.topic ?? "");
    setYear(currentFilters.year?.toString() ?? "");
    setType(currentFilters.type ?? "");
  }, [currentFilters]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <Input
            placeholder="Buscar questões..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && updateFilters()}
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"0"}>Todos os temas</SelectItem>
            {topics.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Todos os anos</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Todos os tipos</SelectItem>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" /> Limpar Filtros
        </Button>
        <Button onClick={updateFilters}>
          <Search className="mr-2 h-4 w-4" /> Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
