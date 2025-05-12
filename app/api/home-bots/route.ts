import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {

    const cursor = request.nextUrl.searchParams.get("cursor") || undefined;
    const searchQuery = request.nextUrl.searchParams.get("q") || undefined;
    const pageSize = request.nextUrl.searchParams.get("page") || undefined;

    console.log("Cursor:", pageSize);

    const bots = await prisma.bot.findMany({
      where: {
        botName: {
          startsWith: searchQuery || undefined,
          mode: "insensitive",
        }
      },
      take: pageSize ? parseInt(pageSize) : 10,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [
        { averageRating: "desc" },
        { id: "asc" },
      ],
      select: {
        id: true,
        botName: true,
        description: true,
        demoVideoLink: true,
        qrCodeImage: true,
        averageRating: true,
        botImage: true,
        category: true,
      },
    });


    const totalItems = !searchQuery ? await prisma.bot.count() : await prisma.bot.count({
      where: {
        botName: {
          startsWith: searchQuery || undefined,
          mode: "insensitive",
        }
      },
    });

    const nextCursor = bots.length > 0 ? bots[bots.length - 1].id : null;

    return NextResponse.json(
      { bots, totalItems, nextCursor },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bots:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}