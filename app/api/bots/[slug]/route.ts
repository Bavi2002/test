import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> } 
) {
  const { slug } = await params; 
  console.log("Slug:", slug);

  const id = slug.split("-")[1];
  console.log("ID:", id);

  try {
    const bot = await prisma.bot.findUnique({
      where: { id },
    });

    if (!bot) {
      return NextResponse.json({ message: "Bot not found" }, { status: 404 });
    }

    console.log("Bot:", bot);

    let user = null;
    if (bot.userId) {
      user = await prisma.user.findUnique({
        where: { id: bot.userId },
      });
    }

    if (!user && bot.userId) {
      console.log(`User not found for userId`);
    }

    const ratings = await prisma.rating.findMany({
      where: { botId: id },
    });

    const botData = {
      id: bot.id,
      botName: bot.botName || "Unknown", 
      botImage: bot.botImage || "", 
      description: bot.description || "No description available",
      category: bot.category || "Uncategorized",
      demoVideoLink: bot.demoVideoLink || "",
      qrCodeImage: bot.qrCodeImage || "",
      reviews: ratings.length || 0,
      averageRating: bot.averageRating || 0,
      publisher: user ? user.company || "Unknown" : "Unknown",
      tags: bot.tags || [],
    };

    console.log("Bot Data:", botData);

    return NextResponse.json(botData);
  } catch (error) {
    console.error("Error fetching bot data:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}