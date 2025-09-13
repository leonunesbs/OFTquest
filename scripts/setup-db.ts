import { db } from "~/server/db";

async function setupDatabase() {
  try {
    console.log("🔧 Configurando banco de dados...");

    // Testar conexão
    await db.$connect();
    console.log("✅ Conexão com banco de dados estabelecida");

    // Verificar se as tabelas existem
    const tableCount = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    console.log(`📊 Tabelas encontradas: ${Number(tableCount[0]?.count ?? 0)}`);

    // Verificar dados existentes
    const questionCount = await db.question.count();
    const topicCount = await db.topic.count();
    const optionCount = await db.option.count();

    console.log("\n📋 Estado atual do banco:");
    console.log(`   📝 Questões: ${questionCount}`);
    console.log(`   📚 Tópicos: ${topicCount}`);
    console.log(`   🔘 Opções: ${optionCount}`);

    if (questionCount > 0) {
      console.log("\n⚠️  Banco já contém dados. Deseja continuar mesmo assim?");
      console.log("   Para limpar o banco, execute: npm run clean-db");
    }

    return true;
  } catch (error) {
    console.error("❌ Erro ao configurar banco de dados:", error);
    return false;
  } finally {
    await db.$disconnect();
  }
}

// Executar o script diretamente
setupDatabase().catch((error) => {
  console.error("💥 Erro fatal:", error);
  process.exit(1);
});

export { setupDatabase };
