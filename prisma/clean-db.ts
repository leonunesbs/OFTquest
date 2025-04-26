import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    // Delete all records from all tables
    await prisma.$transaction([
      prisma.userFavorites.deleteMany(),
      prisma.comment.deleteMany(),
      prisma.playlistItem.deleteMany(),
      prisma.playlistMetric.deleteMany(),
      prisma.playlist.deleteMany(),
      prisma.option.deleteMany(),
      prisma.question.deleteMany(),
      prisma.topic.deleteMany(),
      prisma.topicPrevalence.deleteMany(),
      prisma.userTopicInteraction.deleteMany(),
      prisma.userPlaylistPreferences.deleteMany(),
      prisma.session.deleteMany(),
      prisma.account.deleteMany(),
      prisma.verificationToken.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log("Database cleaned successfully!");
  } catch (error) {
    console.error("Error cleaning database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

void cleanDatabase();
