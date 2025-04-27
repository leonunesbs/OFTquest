import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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
          topics: true,
        },
      });

      return question;
    }),

  // Obter uma questão específica (versão pública sem explicação)
  getByIdPublic: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          year: true,
          type: true,
          number: true,
          statement: true,
          images: true,
          subtopic: true,
          options: {
            select: {
              id: true,
              text: true,
              images: true,
              isCorrect: true,
            },
          },
          topics: {
            select: {
              name: true,
            },
          },
        },
      });

      return question;
    }),

  // Obter próxima questão na sequência
  getNextQuestion: publicProcedure
    .input(
      z.object({
        year: z.number(),
        type: z.string(),
        number: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const nextQuestion = await ctx.db.question.findFirst({
        where: {
          OR: [
            // Mesmo ano, mesmo tipo, número maior
            {
              AND: [
                { year: input.year },
                { type: input.type },
                { number: { gt: input.number } },
              ],
            },
            // Mesmo ano, tipo diferente, número maior
            {
              AND: [{ year: input.year }, { type: { gt: input.type } }],
            },
            // Ano anterior
            {
              year: { lt: input.year },
            },
          ],
        },
        orderBy: [{ year: "desc" }, { type: "asc" }, { number: "asc" }],
        select: {
          id: true,
          year: true,
          type: true,
          number: true,
        },
      });

      return nextQuestion;
    }),

  // Obter questão anterior na sequência
  getPreviousQuestion: publicProcedure
    .input(
      z.object({
        year: z.number(),
        type: z.string(),
        number: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const previousQuestion = await ctx.db.question.findFirst({
        where: {
          OR: [
            // Mesmo ano, mesmo tipo, número menor
            {
              AND: [
                { year: input.year },
                { type: input.type },
                { number: { lt: input.number } },
              ],
            },
            // Mesmo ano, tipo diferente, número menor
            {
              AND: [{ year: input.year }, { type: { lt: input.type } }],
            },
            // Ano posterior
            {
              year: { gt: input.year },
            },
          ],
        },
        orderBy: [{ year: "asc" }, { type: "desc" }, { number: "desc" }],
        select: {
          id: true,
          year: true,
          type: true,
          number: true,
        },
      });

      return previousQuestion;
    }),

  // Obter lista de temas disponíveis
  getTopics: protectedProcedure.query(async ({ ctx }) => {
    const topics = await ctx.db.topic.findMany({
      select: {
        name: true,
      },
    });

    return topics.map((t) => t.name);
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
        images: z.array(z.string()).optional(),
        options: z.array(
          z.object({
            text: z.string(),
            images: z.array(z.string()).optional(),
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
          subtopic: input.subtopic,
          statement: input.statement,
          explanation: input.explanation,
          images: input.images ?? [],
          topics: {
            connect: input.topic.split(", ").map((name) => ({ name })),
          },
          options: {
            create: input.options.map((option) => ({
              text: option.text,
              images: option.images ?? [],
              isCorrect: option.isCorrect,
            })),
          },
        },
        include: {
          options: true,
          topics: true,
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
        images: z.array(z.string()).optional(),
        options: z.array(
          z.object({
            id: z.string().optional(),
            text: z.string(),
            images: z.array(z.string()).optional(),
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
            subtopic: input.subtopic,
            statement: input.statement,
            explanation: input.explanation,
            images: input.images ?? [],
            topics: {
              set: input.topic.split(", ").map((name) => ({ name })),
            },
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
            images: option.images ?? [],
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

  // Obter total de questões por ano e tipo
  getTotalQuestionsByYearAndType: publicProcedure
    .input(
      z.object({
        year: z.number(),
        type: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const total = await ctx.db.question.count({
        where: {
          year: input.year,
          type: input.type,
        },
      });

      return total;
    }),

  // Obter primeira questão do ano e tipo
  getFirstQuestion: publicProcedure
    .input(
      z.object({
        year: z.number(),
        type: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const firstQuestion = await ctx.db.question.findFirst({
        where: {
          year: input.year,
          type: input.type,
        },
        orderBy: [{ number: "asc" }],
        select: {
          id: true,
          year: true,
          type: true,
          number: true,
        },
      });

      return firstQuestion;
    }),

  // Obter última questão do ano e tipo
  getLastQuestion: publicProcedure
    .input(
      z.object({
        year: z.number(),
        type: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const lastQuestion = await ctx.db.question.findFirst({
        where: {
          year: input.year,
          type: input.type,
        },
        orderBy: [{ number: "desc" }],
        select: {
          id: true,
          year: true,
          type: true,
          number: true,
        },
      });

      return lastQuestion;
    }),

  // Obter todas as questões de um ano e tipo específicos
  getAllByYearAndType: publicProcedure
    .input(
      z.object({
        year: z.number(),
        type: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const questions = await ctx.db.question.findMany({
        where: {
          year: input.year,
          type: input.type,
        },
        orderBy: [{ number: "asc" }],
        select: {
          id: true,
          number: true,
        },
      });

      return questions;
    }),
});
