import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Buscar questoes.json via HTTP (fetch)
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/questoes.json`,
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar questoes.json: ${response.statusText}`);
    }

    const questions = await response.json();

    // Inserir as questões no banco de dados
    for (const question of questions) {
      await prisma.question.create({
        data: {
          year: question.year,
          type: question.type,
          number: question.number,
          topic: question.topic || null,
          statement: question.statement,
          options: {
            create: question.options.map((opt: any) => ({
              text: opt.text || null,
              image: opt.image || null,
              isCorrect: opt.isCorrect,
            })),
          },
          explanation: question.explanation || null,
          image: question.image || null,
        },
      });
    }

    return NextResponse.json({ message: "Importação concluída com sucesso!" });
  } catch (error) {
    console.error("Erro ao importar questões:", error);
    return NextResponse.json({ error: "Falha na importação" }, { status: 500 });
  }
}
