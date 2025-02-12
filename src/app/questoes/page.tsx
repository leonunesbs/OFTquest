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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Importar Questões</h1>

      <button
        onClick={handleImport}
        disabled={importing}
        className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-white"
      >
        {importing ? "Importando..." : "Importar Questões"}
      </button>

      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}
