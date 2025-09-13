import { importQuestions } from "./import-questions.js";
import { setupDatabase } from "./setup-db.js";
import { verifyImport } from "./verify-import.js";

async function fullImport() {
  try {
    console.log("🚀 Iniciando processo completo de importação...\n");

    // 1. Verificar banco de dados
    console.log("1️⃣ Verificando banco de dados...");
    const dbReady = await setupDatabase();

    if (!dbReady) {
      console.error("❌ Falha na verificação do banco de dados. Abortando...");
      process.exit(1);
    }

    console.log("\n" + "=".repeat(50) + "\n");

    // 2. Importar questões
    console.log("2️⃣ Importando questões...");
    await importQuestions();

    console.log("\n" + "=".repeat(50) + "\n");

    // 3. Verificar importação
    console.log("3️⃣ Verificando dados importados...");
    await verifyImport();

    console.log("\n🎉 Processo de importação concluído com sucesso!");
    console.log("\n📋 Próximos passos:");
    console.log("   • Execute 'npm run dev' para iniciar o servidor");
    console.log("   • Execute 'npm run db:studio' para visualizar os dados");
    console.log("   • Acesse a aplicação para testar as funcionalidades");
  } catch (error) {
    console.error("💥 Erro durante o processo de importação:", error);
    process.exit(1);
  }
}

// Executar o script diretamente
fullImport().catch((error) => {
  console.error("💥 Erro fatal:", error);
  process.exit(1);
});

export { fullImport };
