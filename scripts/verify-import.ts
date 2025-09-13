import { db } from "~/server/db";

async function verifyImport() {
  try {
    console.log("🔍 Verificando dados importados...");

    // Estatísticas gerais
    const questionCount = await db.question.count();
    const topicCount = await db.topic.count();
    const optionCount = await db.option.count();

    console.log("\n📊 Estatísticas gerais:");
    console.log(`   📝 Total de questões: ${questionCount}`);
    console.log(`   📚 Total de tópicos: ${topicCount}`);
    console.log(`   🔘 Total de opções: ${optionCount}`);

    // Verificar distribuição por ano
    const questionsByYear = await db.question.groupBy({
      by: ["year"],
      _count: {
        id: true,
      },
      orderBy: {
        year: "asc",
      },
    });

    console.log("\n📅 Questões por ano:");
    questionsByYear.forEach(({ year, _count }) => {
      console.log(`   ${year}: ${_count.id} questões`);
    });

    // Verificar distribuição por tipo
    const questionsByType = await db.question.groupBy({
      by: ["type"],
      _count: {
        id: true,
      },
    });

    console.log("\n📋 Questões por tipo:");
    questionsByType.forEach(({ type, _count }) => {
      console.log(`   ${type}: ${_count.id} questões`);
    });

    // Verificar tópicos mais comuns
    const topTopics = await db.topic.findMany({
      include: {
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        questions: {
          _count: "desc",
        },
      },
      take: 10,
    });

    console.log("\n🏆 Top 10 tópicos com mais questões:");
    topTopics.forEach((topic, index) => {
      console.log(
        `   ${index + 1}. ${topic.name}: ${topic._count.questions} questões`,
      );
    });

    // Verificar questões com imagens
    const questionsWithImages = await db.question.count({
      where: {
        images: {
          isEmpty: false,
        },
      },
    });

    const optionsWithImages = await db.option.count({
      where: {
        images: {
          isEmpty: false,
        },
      },
    });

    console.log("\n🖼️  Questões e opções com imagens:");
    console.log(`   📝 Questões com imagens: ${questionsWithImages}`);
    console.log(`   🔘 Opções com imagens: ${optionsWithImages}`);

    // Verificar algumas questões de exemplo
    console.log("\n📖 Exemplos de questões importadas:");
    const sampleQuestions = await db.question.findMany({
      take: 3,
      include: {
        topics: true,
        options: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    sampleQuestions.forEach((question, index) => {
      console.log(
        `\n   ${index + 1}. Questão ${question.year}/${question.type}/${question.number}`,
      );
      console.log(
        `      Tópicos: ${question.topics.map((t) => t.name).join(", ")}`,
      );
      console.log(`      Opções: ${question.options.length}`);
      console.log(`      Imagens: ${question.images.length}`);
      console.log(
        `      Enunciado: ${question.statement.substring(0, 100)}...`,
      );
    });

    console.log("\n✅ Verificação concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro durante a verificação:", error);
  } finally {
    await db.$disconnect();
  }
}

// Executar o script diretamente
verifyImport().catch((error) => {
  console.error("💥 Erro fatal:", error);
  process.exit(1);
});

export { verifyImport };
