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
  topicsCount: number | undefined,
  years: number[],
  selectedTopics?: string[],
  maxQuestions?: number,
): Promise<Question[]> {
  // 1. Obter prevalências de todos os temas para os anos selecionados
  let topicPrevalences: TopicPrevalence[] = await db.topicPrevalence.findMany({
    where: {
      year: { in: years },
    },
  });

  // 1a. (Primeira execução) Se não houver dados, inicializar a partir das questões
  if (topicPrevalences.length === 0) {
    const questions = await db.question.findMany({
      where: { year: { in: years } },
      include: { topics: true },
    });

    const topicCounts = questions.reduce(
      (acc, q) => {
        const topic = q.topics[0]?.name;
        if (!topic) return acc;
        if (!acc[topic]) acc[topic] = 0;
        acc[topic]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalCount =
      Object.values(topicCounts).reduce((sum, count) => sum + count, 0) || 1;

    topicPrevalences = Object.entries(topicCounts).map(([topic, count]) => ({
      id: "",
      topic,
      examType: "CBO",
      year: 2024,
      count,
      prevalence: count / totalCount,
      updatedAt: new Date(),
    }));
  }

  // 2. Calcular prevalência média por tema para os anos selecionados
  const topicPrevalenceMap = topicPrevalences.reduce(
    (acc, tp) => {
      const topic = tp.topic;
      if (!topic) return acc;

      if (!acc[topic]) {
        acc[topic] = { sum: 0, count: 0 };
      }

      const prevalence = tp.prevalence ?? 0;
      acc[topic].sum += prevalence;
      acc[topic].count += 1;

      return acc;
    },
    {} as Record<string, { sum: number; count: number }>,
  );

  // 3. Buscar interações do usuário com temas
  const userInteractions = await db.userTopicInteraction.findMany({
    where: { userId },
  });

  // 4. Calcular ranking para cada tema
  const topicRankings = Object.entries(topicPrevalenceMap).map(
    ([topic, data]) => {
      const interaction = userInteractions.find((ui) => ui.topic === topic);
      const averagePrevalence = data.sum / data.count;

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
        averagePrevalence * PREVALENCE_WEIGHT +
        invertedAccuracy * ACCURACY_WEIGHT +
        normalizedTimeSince * TIME_WEIGHT;

      return {
        topic,
        ranking,
        components: {
          prevalence: averagePrevalence,
          timeSince: normalizedTimeSince,
          accuracy: invertedAccuracy,
        },
      };
    },
  );

  // 5. Ordenar e selecionar temas
  topicRankings.sort((a, b) => b.ranking - a.ranking);

  let selectedTopicsList: string[];
  if (selectedTopics) {
    // Modo customizado: usar os temas selecionados pelo usuário, limitado a 5
    selectedTopicsList = selectedTopics.slice(0, 5);
  } else {
    // Modo automatizado: selecionar os top N temas baseado no ranking, limitado a 5
    selectedTopicsList = topicRankings
      .slice(0, Math.min(topicsCount ?? 3, 5)) // Usa o número de temas especificado, limitado a 5
      .map((tr) => tr.topic);
  }

  if (selectedTopicsList.length === 0) {
    throw new Error("Nenhum tema disponível para gerar a playlist.");
  }

  // 6. Buscar todas as questões para cada tema selecionado
  const selectedQuestions: Question[] = [];
  const selectedQuestionIds = new Set<string>();

  for (const topic of selectedTopicsList) {
    // Buscar todas as questões do tema para os anos selecionados
    const questions = await db.question.findMany({
      where: {
        topics: { some: { name: topic } },
        year: { in: years },
        NOT: {
          id: { in: Array.from(selectedQuestionIds) },
        },
      },
    });

    // Adiciona apenas questões que ainda não foram selecionadas
    for (const question of questions) {
      if (!selectedQuestionIds.has(question.id)) {
        selectedQuestions.push(question);
        selectedQuestionIds.add(question.id);
      }
    }
  }

  // 7. Embaralhar as questões e limitar ao número máximo
  const shuffledQuestions = selectedQuestions.sort(() => Math.random() - 0.5);
  return maxQuestions
    ? shuffledQuestions.slice(0, maxQuestions)
    : shuffledQuestions;
}

/**
 * Atualiza a interação do usuário com um tema baseado na resposta da questão.
 */
export async function updateUserTopicInteraction(
  userId: string,
  questionId: string,
  isCorrect: boolean,
): Promise<void> {
  const question = await db.question.findUnique({
    where: { id: questionId },
    include: { topics: true },
  });
  if (!question) return;

  const topic = question.topics[0]?.name;
  if (!topic) return;

  const existing = await db.userTopicInteraction.findUnique({
    where: { userId_topic: { userId, topic } },
  });

  if (existing) {
    const newQuestionsCount = existing.questionsCount + 1;
    const newCorrectCount = existing.correctCount + (isCorrect ? 1 : 0);
    await db.userTopicInteraction.update({
      where: { userId_topic: { userId, topic } },
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
        topic,
        lastSeenAt: new Date(),
        questionsCount: 1,
        correctCount: isCorrect ? 1 : 0,
        accuracy: isCorrect ? 1 : 0,
      },
    });
  }
}

/**
 * Atualiza a prevalência dos temas com base no período especificado.
 */
export async function updateTopicPrevalence(
  period: "1A" | "2A" | "3A" | "5A" = "5A",
): Promise<void> {
  const currentYear = new Date().getFullYear();
  const yearsAgo = parseInt(period);
  const startYear = currentYear - yearsAgo;

  // Buscar todas as questões do período
  const questions = await db.question.findMany({
    where: {
      year: {
        gte: startYear,
      },
    },
    select: {
      id: true,
      topics: true,
      type: true,
      year: true,
    },
  });

  // Agrupar por tipo de prova
  const examTypes = [...new Set(questions.map((q) => q.type))];

  for (const examType of examTypes) {
    // Filtrar questões do tipo específico
    const typeQuestions = questions.filter((q) => q.type === examType);

    // Calcular total de questões por tipo
    const totalQuestions = typeQuestions.length;
    if (totalQuestions === 0) continue;

    // Agrupar por tema e contar ocorrências
    const topicCounts = typeQuestions.reduce(
      (acc, q) => {
        const topic = q.topics[0]?.name;
        if (!topic) return acc;
        if (!acc[topic]) {
          acc[topic] = 0;
        }
        acc[topic] = (acc[topic] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Calcular e salvar prevalência para cada tema
    for (const [topic, count] of Object.entries(topicCounts)) {
      const prevalence = count / totalQuestions;

      await db.topicPrevalence.upsert({
        where: {
          topic_examType_year: {
            topic,
            examType,
            year: currentYear,
          },
        },
        update: {
          count,
          prevalence,
          updatedAt: new Date(),
        },
        create: {
          topic,
          examType,
          year: currentYear,
          count,
          prevalence,
          updatedAt: new Date(),
        },
      });
    }
  }
}
