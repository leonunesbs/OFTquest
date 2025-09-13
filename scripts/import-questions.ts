import { db } from "~/server/db";
import fs from "fs/promises";
import path from "path";

interface QuestionData {
  year: number;
  type: string;
  number: number;
  topic: string;
  statement: string;
  options: {
    text: string;
    images: string[];
    isCorrect: boolean;
  }[];
  explanation: string;
  images: string[];
  comments: string[];
  questionListsItem: string[];
  userFavorites: string[];
}

async function importQuestions() {
  try {
    console.log("🚀 Iniciando importação das questões...");

    // Ler o arquivo JSON
    const questionsPath = path.join(process.cwd(), "public", "questions.json");
    const questionsData = await fs.readFile(questionsPath, "utf-8");
    const questions: QuestionData[] = JSON.parse(
      questionsData,
    ) as QuestionData[];

    console.log(`📊 Total de questões encontradas: ${questions.length}`);

    // Criar um mapa de tópicos únicos
    const topicsMap = new Map<string, string>();
    const allTopics = new Set<string>();

    // Coletar todos os tópicos únicos
    questions.forEach((question) => {
      if (question.topic) {
        // Dividir tópicos por vírgula e limpar
        const topics = question.topic
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);

        topics.forEach((topic) => {
          allTopics.add(topic);
        });
      }
    });

    console.log(`📚 Tópicos únicos encontrados: ${allTopics.size}`);

    // Criar tópicos no banco de dados
    console.log("📝 Criando tópicos no banco de dados...");
    for (const topicName of allTopics) {
      try {
        const topic = await db.topic.upsert({
          where: { name: topicName },
          update: {},
          create: { name: topicName },
        });
        topicsMap.set(topicName, topic.id);
        console.log(`✅ Tópico criado/encontrado: ${topicName}`);
      } catch (error) {
        console.error(`❌ Erro ao criar tópico ${topicName}:`, error);
      }
    }

    // Processar questões em lotes
    const batchSize = 100;
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;

    console.log("📥 Importando questões...");

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);

      console.log(
        `📦 Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(questions.length / batchSize)}`,
      );

      for (const questionData of batch) {
        try {
          // Verificar se a questão já existe
          const existingQuestion = await db.question.findUnique({
            where: {
              year_type_number: {
                year: questionData.year,
                type: questionData.type,
                number: questionData.number,
              },
            },
          });

          if (existingQuestion) {
            console.log(
              `⏭️  Questão ${questionData.year}/${questionData.type}/${questionData.number} já existe, pulando...`,
            );
            processedCount++;
            continue;
          }

          // Mapear tópicos para IDs
          const topicIds: string[] = [];
          if (questionData.topic) {
            const topics = questionData.topic
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t.length > 0);

            topics.forEach((topicName) => {
              const topicId = topicsMap.get(topicName);
              if (topicId) {
                topicIds.push(topicId);
              }
            });
          }

          // Criar a questão
          const question = await db.question.create({
            data: {
              year: questionData.year,
              type: questionData.type,
              number: questionData.number,
              subtopic: questionData.topic || null,
              statement: questionData.statement,
              explanation: questionData.explanation || "",
              images: questionData.images || [],
              topics: {
                connect: topicIds.map((id) => ({ id })),
              },
            },
          });

          // Criar as opções
          for (const optionData of questionData.options) {
            await db.option.create({
              data: {
                questionId: question.id,
                text: optionData.text || "",
                images: optionData.images || [],
                isCorrect: optionData.isCorrect,
              },
            });
          }

          successCount++;
          processedCount++;

          if (processedCount % 50 === 0) {
            console.log(
              `📈 Progresso: ${processedCount}/${questions.length} questões processadas`,
            );
          }
        } catch (error) {
          errorCount++;
          console.error(
            `❌ Erro ao processar questão ${questionData.year}/${questionData.type}/${questionData.number}:`,
            error,
          );
        }
      }
    }

    console.log("\n🎉 Importação concluída!");
    console.log(`📊 Estatísticas:`);
    console.log(`   ✅ Sucessos: ${successCount}`);
    console.log(`   ❌ Erros: ${errorCount}`);
    console.log(`   📝 Total processado: ${processedCount}`);
    console.log(`   📚 Tópicos criados: ${topicsMap.size}`);

    // Verificar dados importados
    const totalQuestions = await db.question.count();
    const totalOptions = await db.option.count();
    const totalTopics = await db.topic.count();

    console.log("\n📋 Verificação final:");
    console.log(`   📝 Questões no banco: ${totalQuestions}`);
    console.log(`   🔘 Opções no banco: ${totalOptions}`);
    console.log(`   📚 Tópicos no banco: ${totalTopics}`);
  } catch (error) {
    console.error("💥 Erro durante a importação:", error);
  } finally {
    await db.$disconnect();
  }
}

// Executar o script diretamente
importQuestions().catch((error) => {
  console.error("💥 Erro fatal:", error);
  process.exit(1);
});

export { importQuestions };
