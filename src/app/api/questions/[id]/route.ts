import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const question = await db.question.findUnique({
      where: {
        id: params.id,
      },
      include: {
        options: true,
        topics: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

interface UpdateQuestionBody {
  title?: string;
  description?: string;
  options?: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  topics?: string[];
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = (await request.json()) as UpdateQuestionBody;
    const { title, description, options, topics } = body;

    const question = await db.question.update({
      where: {
        id: params.id,
      },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(options && {
          options: {
            deleteMany: {},
            create: options,
          },
        }),
        ...(topics && {
          topics: {
            set: topics.map((topicId) => ({ id: topicId })),
          },
        }),
      },
      include: {
        options: true,
        topics: true,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
