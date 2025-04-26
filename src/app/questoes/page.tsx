/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useState } from "react";

export default function QuestoesPage() {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  const handleImport = async () => {
    setImporting(true);
    setMessage("");

    try {
      const response = await fetch("/api/import-questoes", { method: "POST" });

      if (!response.ok) {
        throw new Error(`Erro ao importar: ${response.statusText}`);
      }

      const data = await response.json();
      setMessage(data.message || "Importação concluída com sucesso!");
    } catch (error) {
      setMessage("Erro ao importar questões.");
    } finally {
      setImporting(false);
    }
  };

  const handleImportTopics = async () => {
    setImporting(true);
    setMessage("");

    try {
      const response = await fetch("/api/import-topics", { method: "POST" });

      if (!response.ok) {
        throw new Error(`Erro ao importar tópicos: ${response.statusText}`);
      }

      const data = await response.json();
      setMessage(
        data.message || "Importação de tópicos concluída com sucesso!",
      );
    } catch (error) {
      setMessage("Erro ao importar tópicos.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Importar Questões</h1>

      <div className="mt-4 space-x-4">
        <button
          onClick={handleImport}
          disabled={importing}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white"
        >
          {importing ? "Importando..." : "Importar Questões"}
        </button>

        <button
          onClick={handleImportTopics}
          disabled={importing}
          className="rounded-lg bg-green-500 px-4 py-2 text-white"
        >
          {importing ? "Importando..." : "Importar Tópicos"}
        </button>
      </div>

      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}
