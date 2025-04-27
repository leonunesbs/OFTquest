import { NextResponse, type NextRequest } from "next/server";
import { db } from "~/server/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const question = await db.question.findUnique({
      where: {
        id,
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateQuestionBody;
    const { title, description, options, topics } = body;

    const question = await db.question.update({
      where: {
        id,
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
