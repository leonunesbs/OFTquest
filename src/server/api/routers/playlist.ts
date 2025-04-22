import { createTRPCRouter, protectedProcedure } from "../trpc";
// src/server/api/routers/playlist.ts
import {
  generatePlaylist,
  updateUserTopicInteraction,
} from "../../services/playlistService";

import { z } from "zod";
import { db } from "~/server/db";

export const playlistRouter = createTRPCRouter({
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
              question: { include: { options: true } },
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
        topicsCount: z.number().min(1).max(20),
        questionsCount: z.number().min(1).max(100),
        years: z.array(z.number()).min(1, "Selecione ao menos um ano"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Passa também os anos para o serviço
      const questions = await generatePlaylist(
        userId,
        input.topicsCount,
        input.questionsCount,
        input.years,
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
      const userId = ctx.session.user.id;
      const currentYear = new Date().getFullYear();

      const topicInteractions = await ctx.db.userTopicInteraction.findMany({
        where: { userId },
      });

      const topicPrevalences = await ctx.db.topicPrevalence.findMany({
        where: {
          year: {
            gte: currentYear - parseInt(input.period),
          },
          examType: input.examType,
        },
      });

      return topicInteractions.map((ti) => ({
        topic: ti.topic,
        accuracy: ti.accuracy,
        questionsCount: ti.questionsCount,
        correctCount: ti.correctCount,
        lastSeenAt: ti.lastSeenAt,
        prevalence:
          topicPrevalences.find((tp) => tp.topic === ti.topic)?.prevalence ?? 0,
      }));
    }),
});

// Atualiza métricas da playlist
async function updatePlaylistMetrics(playlistId: string): Promise<void> {
  const playlistItems = await db.playlistItem.findMany({
    where: { playlistId },
    include: { question: { include: { options: true } } },
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
    const topic = item.question.topic;
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
