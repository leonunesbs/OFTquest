import { createTRPCRouter, protectedProcedure } from "../trpc";

import { type Prisma } from "@prisma/client";
// src/server/api/routers/question.ts
import { z } from "zod";

export const questionRouter = createTRPCRouter({
  // Obter todas as questões (paginadas)
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      // Construir condição de busca
      const where = search
        ? {
            OR: [
              {
                topic: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                subtopic: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                statement: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
            ],
          }
        : {};

      // Buscar questões
      const questions = await ctx.db.question.findMany({
        where,
        orderBy: [{ year: "desc" }, { number: "asc" }],
        skip,
        take: limit,
      });

      // Contar total para paginação
      const total = await ctx.db.question.count({ where });

      return {
        questions,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    }),

  // Obter uma questão específica
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.id },
        include: {
          options: true,
        },
      });

      return question;
    }),

  // Obter lista de temas disponíveis
  getTopics: protectedProcedure.query(async ({ ctx }) => {
    const topics = await ctx.db.question.groupBy({
      by: ["topic"],
    });

    return topics.map((t) => t.topic);
  }),

  // Criar nova questão
  create: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        type: z.string(),
        number: z.number(),
        topic: z.string(),
        subtopic: z.string().optional(),
        statement: z.string(),
        explanation: z.string(),
        image: z.string().optional(),
        options: z.array(
          z.object({
            text: z.string(),
            image: z.string().optional(),
            isCorrect: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se o usuário tem permissão (admin)
      if (ctx.session.user.role !== "admin") {
        throw new Error("Você não tem permissão para criar questões");
      }

      // Criar questão com suas opções
      const question = await ctx.db.question.create({
        data: {
          year: input.year,
          type: input.type,
          number: input.number,
          topic: input.topic,
          subtopic: input.subtopic,
          statement: input.statement,
          explanation: input.explanation,
          image: input.image,
          options: {
            create: input.options.map((option) => ({
              text: option.text,
              image: option.image,
              isCorrect: option.isCorrect,
            })),
          },
        },
        include: {
          options: true,
        },
      });

      return question;
    }),

  // Atualizar questão existente
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        year: z.number(),
        type: z.string(),
        number: z.number(),
        topic: z.string(),
        subtopic: z.string().optional(),
        statement: z.string(),
        explanation: z.string(),
        image: z.string().optional(),
        options: z.array(
          z.object({
            id: z.string().optional(),
            text: z.string(),
            image: z.string().optional(),
            isCorrect: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se o usuário tem permissão (admin)
      if (ctx.session.user.role !== "admin") {
        throw new Error("Você não tem permissão para editar questões");
      }

      // Atualizar questão em uma transação
      const question = await ctx.db.$transaction(async (tx) => {
        // 1. Atualizar a questão
        await tx.question.update({
          where: { id: input.id },
          data: {
            year: input.year,
            type: input.type,
            number: input.number,
            topic: input.topic,
            subtopic: input.subtopic,
            statement: input.statement,
            explanation: input.explanation,
            image: input.image,
          },
        });

        // 2. Excluir opções existentes
        await tx.option.deleteMany({
          where: { questionId: input.id },
        });

        // 3. Criar novas opções
        await tx.option.createMany({
          data: input.options.map((option) => ({
            questionId: input.id,
            text: option.text,
            image: option.image,
            isCorrect: option.isCorrect,
          })),
        });

        // 4. Retornar questão atualizada com opções
        return tx.question.findUnique({
          where: { id: input.id },
          include: { options: true },
        });
      });

      return question;
    }),

  // Excluir questão
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verificar se o usuário tem permissão (admin)
      if (ctx.session.user.role !== "admin") {
        throw new Error("Você não tem permissão para excluir questões");
      }

      // Excluir questão (as opções serão excluídas automaticamente pela relação onDelete: Cascade)
      await ctx.db.question.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
