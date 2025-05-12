import { getUserSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const body = await req.json();
    const { botName, description, category, demoVideoLink, botLogoUrl, qrCodeUrl, tags } = body;
    // const newUser = await prisma.user.create({
    //   data: {
    //     userId: session.user.id,
    //     name: "Test", //session.user.name,
    //     email:"test@gmail.com", //session.user.email,
    //     password:"123",
    //     image:"egergteg", //session.user.image,
    //     company:"Nothing Apps",//session.user.company,    
    //   },
    // });

    const newBot = await prisma.bot.create({
      data: {
        botName,
        description,
        category,
        demoVideoLink,
        botImage: botLogoUrl,
        qrCodeImage: qrCodeUrl,
        // averageRating:5,
        // user: { connect: { userId: session.user.id } },
        userId: session.user.id,
        tags: tags || [],


      },
    });

    // const newRating = await prisma.rating.create({
    //   data:{
    //     value:3,
    //     botId: newBot.id,
    //     userId: session.user.id,
    //   }
    // });

    return new Response(JSON.stringify(newBot), { status: 200 });
  } catch (error) {
    console.error("Error creating bot:", error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }


    const [bots, totalBots] = await Promise.all([
      prisma.bot.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bot.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json(
      { bots, totalBots },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching bots:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getUserSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { botId } = await req.json();

    if (!botId) {
      return NextResponse.json({ message: "Bot ID is required" }, { status: 400 });
    }

    const deletedBot = await prisma.bot.delete({
      where: { id: botId },
    });

    return NextResponse.json(deletedBot, { status: 200 });
  } catch (error) {
    console.error("Error deleting bot:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
