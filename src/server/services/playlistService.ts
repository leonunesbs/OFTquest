// src/server/services/playlistService.ts
import type { Question, TopicPrevalence } from "@prisma/client";

import { db } from "../db";

// Constantes para os pesos (fixos inicialmente)
const PREVALENCE_WEIGHT = 0.4;
const ACCURACY_WEIGHT = 0.35;
const TIME_WEIGHT = 0.25;

/**
 * Gera uma playlist de questões baseada em prevalência, acurácia,
 * tempo desde última revisão e filtragem por anos.
 */
export async function generatePlaylist(
  userId: string,
  topicsCount: number,
  questionsCount: number,
  years: number[],
): Promise<Question[]> {
  // 1. Obter prevalências de todos os temas
  let topicPrevalences: TopicPrevalence[] = await db.topicPrevalence.findMany();

  // 1a. (Primeira execução) Se não houver dados, inicializar a partir das questões
  if (topicPrevalences.length === 0) {
    const topicCounts = await db.question.groupBy({
      by: ["topic"],
      where: { year: { in: years } },
      _count: { id: true },
    });
    const totalCount =
      topicCounts.reduce((sum, tc) => sum + tc._count.id, 0) || 1;

    topicPrevalences = topicCounts.map((tc) => ({
      id: "",
      topic: tc.topic,
      examType: null,
      count: tc._count.id,
      prevalence: tc._count.id / totalCount,
      updatedAt: new Date(),
    }));
    // Nota: não persiste no DB; use upsert aqui se quiser gravar.
  }

  // 2. Buscar interações do usuário com temas
  const userInteractions = await db.userTopicInteraction.findMany({
    where: { userId },
  });

  // 3. Calcular ranking para cada tema
  const topicRankings = topicPrevalences.map((tp) => {
    const interaction = userInteractions.find((ui) => ui.topic === tp.topic);

    const daysSinceLastSeen = interaction
      ? Math.floor(
          (Date.now() - interaction.lastSeenAt.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 999;
    const normalizedTimeSince = Math.min(daysSinceLastSeen / 30, 1);

    const accuracy = interaction?.accuracy ?? 0.5;
    const invertedAccuracy = 1 - accuracy;

    const ranking =
      tp.prevalence * PREVALENCE_WEIGHT +
      invertedAccuracy * ACCURACY_WEIGHT +
      normalizedTimeSince * TIME_WEIGHT;

    return {
      topic: tp.topic,
      ranking,
      components: {
        prevalence: tp.prevalence,
        timeSince: normalizedTimeSince,
        accuracy: invertedAccuracy,
      },
    };
  });

  // 4. Ordenar e selecionar top N temas
  topicRankings.sort((a, b) => b.ranking - a.ranking);
  const selectedTopics = topicRankings
    .slice(0, topicsCount)
    .map((tr) => tr.topic);

  if (selectedTopics.length === 0) {
    throw new Error("Nenhum tema disponível para gerar a playlist.");
  }

  // 5. Quantidade de questões por tema
  const questionsPerTopic = Math.ceil(questionsCount / selectedTopics.length);

  // 6. Buscar questões para cada tema, filtrando pelos anos
  const selectedQuestions: Question[] = [];

  for (const topic of selectedTopics) {
    // Questões não respondidas ainda
    const fresh = await db.question.findMany({
      where: {
        topic,
        year: { in: years },
        NOT: { playlistItems: { some: { playlist: { userId } } } },
      },
      take: questionsPerTopic,
    });
    selectedQuestions.push(...fresh);

    // Se faltar, busca também as respondidas
    if (fresh.length < questionsPerTopic) {
      const more = await db.question.findMany({
        where: {
          topic,
          year: { in: years },
          playlistItems: { some: { playlist: { userId } } },
        },
        orderBy: { playlistItems: { _count: "asc" } },
        take: questionsPerTopic - fresh.length,
      });
      selectedQuestions.push(...more);
    }
  }

  // 7. Truncar ao total desejado e embaralhar
  return selectedQuestions
    .slice(0, questionsCount)
    .sort(() => Math.random() - 0.5);
}

/**
 * Atualiza a interação do usuário com um tema baseado na resposta da questão.
 */
export async function updateUserTopicInteraction(
  userId: string,
  questionId: string,
  isCorrect: boolean,
): Promise<void> {
  const question = await db.question.findUnique({ where: { id: questionId } });
  if (!question) return;

  const existing = await db.userTopicInteraction.findUnique({
    where: { userId_topic: { userId, topic: question.topic } },
  });

  if (existing) {
    const newQuestionsCount = existing.questionsCount + 1;
    const newCorrectCount = existing.correctCount + (isCorrect ? 1 : 0);
    await db.userTopicInteraction.update({
      where: { userId_topic: { userId, topic: question.topic } },
      data: {
        lastSeenAt: new Date(),
        questionsCount: newQuestionsCount,
        correctCount: newCorrectCount,
        accuracy: newCorrectCount / newQuestionsCount,
      },
    });
  } else {
    await db.userTopicInteraction.create({
      data: {
        userId,
        topic: question.topic,
        lastSeenAt: new Date(),
        questionsCount: 1,
        correctCount: isCorrect ? 1 : 0,
        accuracy: isCorrect ? 1 : 0,
      },
    });
  }
}

/**
 * Atualiza a prevalência dos temas com base nas questões dos últimos 5 anos.
 */
export async function updateTopicPrevalence(): Promise<void> {
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const topicCounts = await db.question.groupBy({
    by: ["topic"],
    where: { year: { gte: fiveYearsAgo.getFullYear() } },
    _count: { id: true },
  });

  const totalQuestions =
    topicCounts.reduce((sum, tc) => sum + tc._count.id, 0) || 1;

  for (const tc of topicCounts) {
    await db.topicPrevalence.upsert({
      where: { topic: tc.topic },
      update: {
        count: tc._count.id,
        prevalence: tc._count.id / totalQuestions,
        updatedAt: new Date(),
      },
      create: {
        topic: tc.topic,
        examType: null,
        count: tc._count.id,
        prevalence: tc._count.id / totalQuestions,
        updatedAt: new Date(),
      },
    });
  }
}
