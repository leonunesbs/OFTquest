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

  getMetrics: protectedProcedure
    .input(
      z.object({ period: z.enum(["week", "month", "last30days", "year"]) }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const now = new Date();
      const startDate = new Date();
      const endDate = new Date();

      switch (input.period) {
        case "week":
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "month":
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "last30days":
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "year":
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
      }

      // Get all playlist items for the user
      const playlistItems = await ctx.db.playlistItem.findMany({
        where: {
          playlist: { userId },
          respondedAt: { not: undefined },
          selectedOptionId: { not: null },
        },
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
      });

      // Calculate total metrics
      const totalAnswered = playlistItems.length;
      const totalCorrect = playlistItems.filter((item) =>
        item.question.options.some(
          (o) => o.id === item.selectedOptionId && o.isCorrect,
        ),
      ).length;
      const totalAccuracy =
        totalAnswered > 0 ? totalCorrect / totalAnswered : 0;

      // Calculate period metrics
      const periodItems = playlistItems.filter(
        (item) =>
          item.respondedAt! >= startDate && item.respondedAt! <= endDate,
      );
      const periodAnswered = periodItems.length;
      const periodCorrect = periodItems.filter((item) =>
        item.question.options.some(
          (o) => o.id === item.selectedOptionId && o.isCorrect,
        ),
      ).length;
      const periodAccuracy =
        periodAnswered > 0 ? periodCorrect / periodAnswered : 0;

      // Calculate data for charts
      const questionsByPeriod: Array<{ period: string; count: number }> = [];
      const accuracyByPeriod: Array<{ period: string; accuracy: number }> = [];

      if (input.period === "week") {
        // Group by day of week
        for (let i = 0; i < 7; i++) {
          const dayStart = new Date(startDate);
          dayStart.setDate(startDate.getDate() + i);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const dayItems = periodItems.filter(
            (item) =>
              item.respondedAt! >= dayStart && item.respondedAt! <= dayEnd,
          );
          const dayCount = dayItems.length;
          const dayCorrect = dayItems.filter((item) =>
            item.question.options.some(
              (o) => o.id === item.selectedOptionId && o.isCorrect,
            ),
          ).length;
          const dayAccuracy = dayCount > 0 ? dayCorrect / dayCount : 0;

          questionsByPeriod.push({
            period: dayStart.toLocaleDateString("pt-BR", { weekday: "short" }),
            count: dayCount,
          });
          accuracyByPeriod.push({
            period: dayStart.toLocaleDateString("pt-BR", { weekday: "short" }),
            accuracy: dayAccuracy,
          });
        }
      } else if (input.period === "month") {
        // Group by day
        for (let i = 0; i < 30; i++) {
          const dayStart = new Date(startDate);
          dayStart.setDate(startDate.getDate() + i);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          const dayItems = periodItems.filter(
            (item) =>
              item.respondedAt! >= dayStart && item.respondedAt! <= dayEnd,
          );
          const dayCount = dayItems.length;
          const dayCorrect = dayItems.filter((item) =>
            item.question.options.some(
              (o) => o.id === item.selectedOptionId && o.isCorrect,
            ),
          ).length;
          const dayAccuracy = dayCount > 0 ? dayCorrect / dayCount : 0;

          questionsByPeriod.push({
            period: dayStart.toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "short",
            }),
            count: dayCount,
          });
          accuracyByPeriod.push({
            period: dayStart.toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "short",
            }),
            accuracy: dayAccuracy,
          });
        }
      } else if (input.period === "last30days") {
        // Group by week
        const weeks = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
        );
        for (let i = 0; i < weeks; i++) {
          const weekStart = new Date(startDate);
          weekStart.setDate(startDate.getDate() + i * 7);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const weekItems = periodItems.filter(
            (item) =>
              item.respondedAt! >= weekStart && item.respondedAt! <= weekEnd,
          );
          const weekCount = weekItems.length;
          const weekCorrect = weekItems.filter((item) =>
            item.question.options.some(
              (o) => o.id === item.selectedOptionId && o.isCorrect,
            ),
          ).length;
          const weekAccuracy = weekCount > 0 ? weekCorrect / weekCount : 0;

          questionsByPeriod.push({
            period: `Semana ${i + 1}`,
            count: weekCount,
          });
          accuracyByPeriod.push({
            period: `Semana ${i + 1}`,
            accuracy: weekAccuracy,
          });
        }
      } else if (input.period === "year") {
        // Group by month
        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(now.getFullYear(), i, 1);
          const monthEnd = new Date(now.getFullYear(), i + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);

          const monthItems = periodItems.filter(
            (item) =>
              item.respondedAt! >= monthStart && item.respondedAt! <= monthEnd,
          );
          const monthCount = monthItems.length;
          const monthCorrect = monthItems.filter((item) =>
            item.question.options.some(
              (o) => o.id === item.selectedOptionId && o.isCorrect,
            ),
          ).length;
          const monthAccuracy = monthCount > 0 ? monthCorrect / monthCount : 0;

          questionsByPeriod.push({
            period: monthStart.toLocaleDateString("pt-BR", { month: "short" }),
            count: monthCount,
          });
          accuracyByPeriod.push({
            period: monthStart.toLocaleDateString("pt-BR", { month: "short" }),
            accuracy: monthAccuracy,
          });
        }
      }

      return {
        totalAnswered,
        totalAccuracy,
        periodAnswered,
        periodAccuracy,
        questionsByPeriod,
        accuracyByPeriod,
      };
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
