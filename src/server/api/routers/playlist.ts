import { createTRPCRouter, protectedProcedure } from "../trpc";
// src/server/api/routers/playlist.ts
import {
  generatePlaylist,
  updateUserTopicInteraction,
} from "~/server/services/playlistService";

import { z } from "zod";
import { db } from "~/server/db";

export const playlistRouter = createTRPCRouter({
  // Get available topics
  getAvailableTopics: protectedProcedure.query(async ({ ctx }) => {
    const topics = await ctx.db.topic.findMany({
      orderBy: { name: "asc" },
    });
    return topics;
  }),

  // Obter uma playlist específica com suas questões
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const playlist = await ctx.db.playlist.findUnique({
        where: { id: input.id, userId },
        include: {
          items: {
            include: {
              question: { include: { options: true, topics: true } },
            },
            orderBy: { questionId: "asc" },
          },
        },
      });
      return playlist;
    }),

  // Gerar uma nova playlist
  generate: protectedProcedure
    .input(
      z.object({
        mode: z.enum(["automated", "custom"]),
        topicsCount: z.number().min(1).max(20).optional(),
        selectedTopics: z.array(z.string()).optional(),
        questionsCount: z.number().min(1).max(100),
        years: z.array(z.number()).min(1, "Selecione ao menos um ano"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Passa também os anos para o serviço
      const questions = await generatePlaylist(
        userId,
        input.mode === "automated" ? input.topicsCount : undefined,
        input.years,
        input.mode === "custom" ? input.selectedTopics : undefined,
        input.questionsCount,
      );

      const playlist = await ctx.db.playlist.create({
        data: {
          name: `Playlist ${new Date().toLocaleDateString("pt-BR")}`,
          userId,
          items: {
            create: questions.map((q) => ({ questionId: q.id })),
          },
        },
        include: {
          items: {
            include: { question: { include: { options: true } } },
          },
        },
      });

      return playlist;
    }),

  // Responder a uma questão na playlist
  answerQuestion: protectedProcedure
    .input(
      z.object({ playlistItemId: z.string(), selectedOptionId: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const playlistItem = await ctx.db.playlistItem.update({
        where: { id: input.playlistItemId },
        data: {
          selectedOptionId: input.selectedOptionId,
          respondedAt: new Date(),
        },
        include: {
          question: { include: { options: true } },
        },
      });

      const isCorrect = playlistItem.question.options.some(
        (o) => o.id === input.selectedOptionId && o.isCorrect,
      );

      await updateUserTopicInteraction(
        userId,
        playlistItem.questionId,
        isCorrect,
      );

      await updatePlaylistMetrics(playlistItem.playlistId);
      return { playlistItem, isCorrect };
    }),

  // Obter métricas do usuário por tema
  getUserTopicMetrics: protectedProcedure
    .input(
      z.object({
        period: z.enum(["1A", "2A", "3A", "5A"]).default("5A"),
        examType: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id;
        const currentYear = new Date().getFullYear();
        const yearsAgo = parseInt(input.period);

        // Get user's topic interactions
        const topicInteractions = await ctx.db.userTopicInteraction.findMany({
          where: { userId },
        });

        // Get topic prevalences for the selected period
        const topicPrevalences = await ctx.db.topicPrevalence.findMany({
          where: {
            year: {
              gte: currentYear - yearsAgo,
            },
            examType: input.examType,
          },
        });

        // Se não houver prevalências para o tipo de prova selecionado,
        // buscar todas as prevalências e calcular a média ponderada
        if (topicPrevalences.length === 0 && input.examType) {
          const allPrevalences = await ctx.db.topicPrevalence.findMany({
            where: {
              year: {
                gte: currentYear - yearsAgo,
              },
            },
          });

          // Agrupar por tema e calcular a média ponderada por tipo de prova
          const prevalenceByTopic = allPrevalences.reduce(
            (acc, tp) => {
              const current = acc[tp.topic] ?? { sum: 0, totalCount: 0 };
              return {
                ...acc,
                [tp.topic]: {
                  sum: current.sum + tp.prevalence * tp.count,
                  totalCount: current.totalCount + tp.count,
                },
              };
            },
            {} as Record<string, { sum: number; totalCount: number }>,
          );

          // Calcular prevalência normalizada para cada tema
          topicPrevalences.push(
            ...Object.entries(prevalenceByTopic).map(([topic, data]) => ({
              id: "",
              topic,
              examType: input.examType!,
              year: currentYear,
              count: data.totalCount,
              prevalence: data.totalCount > 0 ? data.sum / data.totalCount : 0,
              updatedAt: new Date(),
            })),
          );
        }

        // Calculate average prevalence for each topic
        const topicPrevalenceMap = topicPrevalences.reduce(
          (acc, tp) => {
            const current = acc[tp.topic] ?? { sum: 0, count: 0 };
            return {
              ...acc,
              [tp.topic]: {
                sum: current.sum + tp.prevalence,
                count: current.count + 1,
              },
            };
          },
          {} as Record<string, { sum: number; count: number }>,
        );

        const result = topicInteractions.map((ti) => {
          const topicPrevalence = topicPrevalenceMap[ti.topic];
          return {
            topic: ti.topic,
            accuracy: ti.accuracy || 0,
            questionsCount: ti.questionsCount || 0,
            correctCount: ti.correctCount || 0,
            lastSeenAt: ti.lastSeenAt,
            prevalence: topicPrevalence
              ? topicPrevalence.sum / topicPrevalence.count
              : 0,
          };
        });

        return result;
      } catch (error) {
        console.error("Error in getUserTopicMetrics:", error);
        throw error;
      }
    }),

  getTopicRankings: protectedProcedure.query(async ({ ctx }) => {
    // 1. Obter prevalências de todos os temas
    const topicPrevalences = await ctx.db.topicPrevalence.findMany();

    // 2. Agrupar por ano e tipo de prova
    const topicsByYearAndType = topicPrevalences.reduce(
      (acc, tp) => {
        const year = tp.year;
        if (!acc[year]) {
          acc[year] = {
            teorica1: [],
            teorica2: [],
            teoricoPratica: [],
          };
        }
        const examType = tp.examType.toLowerCase();
        if (examType.includes("teorica-1")) {
          acc[year].teorica1.push({
            topic: tp.topic,
            prevalence: tp.prevalence,
          });
        } else if (examType.includes("teorica-2")) {
          acc[year].teorica2.push({
            topic: tp.topic,
            prevalence: tp.prevalence,
          });
        } else if (examType.includes("teorico-pratica")) {
          acc[year].teoricoPratica.push({
            topic: tp.topic,
            prevalence: tp.prevalence,
          });
        }
        return acc;
      },
      {} as Record<
        number,
        {
          teorica1: Array<{ topic: string; prevalence: number }>;
          teorica2: Array<{ topic: string; prevalence: number }>;
          teoricoPratica: Array<{ topic: string; prevalence: number }>;
        }
      >,
    );

    // 3. Ordenar anos e temas por prevalência
    const sortedYears = Object.keys(topicsByYearAndType)
      .map(Number)
      .sort((a, b) => b - a);

    return sortedYears.map((year) => ({
      year,
      examTypes: {
        teorica1: topicsByYearAndType[year]?.teorica1?.sort(
          (a, b) => b.prevalence - a.prevalence,
        ),
        teorica2: topicsByYearAndType[year]?.teorica2?.sort(
          (a, b) => b.prevalence - a.prevalence,
        ),
        teoricoPratica: topicsByYearAndType[year]?.teoricoPratica?.sort(
          (a, b) => b.prevalence - a.prevalence,
        ),
      },
    }));
  }),
});

// Atualiza métricas da playlist
async function updatePlaylistMetrics(playlistId: string): Promise<void> {
  const playlistItems = await db.playlistItem.findMany({
    where: { playlistId },
    include: { question: { include: { options: true, topics: true } } },
  });

  const answeredItems = playlistItems.filter(
    (pi) => pi.selectedOptionId !== null,
  );
  const answeredCount = answeredItems.length;

  const correctCount = playlistItems.filter(
    (pi) =>
      pi.selectedOptionId !== null &&
      pi.question.options.some(
        (o) => o.id === pi.selectedOptionId && o.isCorrect,
      ),
  ).length;

  const accuracy = answeredCount > 0 ? correctCount / answeredCount : 0;

  const metricsByTopic: Record<string, { correct: number; answered: number }> =
    {};
  for (const item of playlistItems) {
    const topics = item.question.topics.map((t) => t.name);
    for (const topic of topics) {
      if (!metricsByTopic[topic])
        metricsByTopic[topic] = { correct: 0, answered: 0 };
      if (item.selectedOptionId) {
        metricsByTopic[topic].answered++;
        if (
          item.question.options.some(
            (o) => o.id === item.selectedOptionId && o.isCorrect,
          )
        ) {
          metricsByTopic[topic].correct++;
        }
      }
    }
  }

  await db.playlistMetric.upsert({
    where: { playlistId },
    update: {
      answeredQuestions: answeredCount,
      correctAnswers: correctCount,
      accuracy,
      metricsByTopic,
      updatedAt: new Date(),
    },
    create: {
      playlistId,
      answeredQuestions: answeredCount,
      correctAnswers: correctCount,
      accuracy,
      metricsByTopic,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
