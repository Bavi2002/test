import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { botId, value } = await req.json();
    console.log("Bot ID:", botId);
    console.log("Rating Value:", value);

    if (!botId || typeof value !== "number" || value < 1 || value > 5) {
      return NextResponse.json(
        { message: "Invalid botId or rating value (must be 1–5)" },
        { status: 400 }
      );
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    console.log("Bot:", bot);
    if (!bot) {
      return NextResponse.json({ message: "Bot not found" }, { status: 404 });
    }

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_botId: {
          userId: session.user.id,
          botId,
        },
      },
    });

    console.log("Existing Rating:", existingRating);

    if (existingRating) {
      return NextResponse.json(
        { message: "You have already rated this bot" },
        { status: 409 }
      );
    }

    const rating = await prisma.rating.create({
      data: {
        value,
        userId: session.user.id,
        botId,
      },
    });

    console.log("New Rating:", rating);

    const ratings = await prisma.rating.findMany({
      where: { botId },
      select: { value: true },
    });
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
        : null;
    await prisma.bot.update({
      where: { id: botId },
      data: { averageRating },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}