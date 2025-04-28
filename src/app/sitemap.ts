import type { MetadataRoute } from "next";
import { db } from "~/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://oftquest.com.br";

  // Fetch all question IDs from the database
  const questions = await db.question.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
  });

  // Create sitemap entries for each question
  const questionUrls = questions.map((question) => ({
    url: `${baseUrl}/questions/${question.id}`,
    lastModified: question.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/questions`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/premium`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...questionUrls,
  ];
}
