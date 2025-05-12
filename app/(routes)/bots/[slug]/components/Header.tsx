"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Heart } from "lucide-react";

type Bot = {
  id: string,
  botName: string;
  publisher: string;
  averageRating: number;
  reviews: number;
  // downloads: string;
  // ageRating: string;
  userId: string,
  botImage: string;

};

export default function Header({ bot }: { bot: Bot }) {
  console.log("Bot data in Header:", bot);
  const rating = Math.round(bot.averageRating || 0)

  const filledStars = "★".repeat(rating);
  const emptyStars = "☆".repeat(5 - rating);
  const starDisplay = bot.averageRating
    ? `${filledStars}${emptyStars}`
    : `${emptyStars}`;

  return (
    <div className="flex items-start justify-between gap-6 border-b pb-6">
      <div className="flex items-start gap-4">
        <Image
          src={bot.botImage || ""}
          alt={bot.botName}
          title={bot.botName}
          width={100}
          height={100}
          priority
          className="rounded-xl"
        />
        <div>
          <h1 className="text-2xl font-bold">{bot.botName}</h1>
          <p className="text-base text-muted-foreground font-medium">{bot.publisher.toUpperCase()}</p>
          <div className="flex gap-4 text-sm mt-1">
            <span
              className="text-base sm:text-sm md:text-xl text-yellow-500"
              aria-label={`Rating: ${bot.averageRating || 0
                } out of 5 stars`}
            >
              {starDisplay}<span className="text-base text-black">({(bot.reviews)} reviews)</span></span>
            {/* <span>⭐ {bot.averageRating} ({(bot.reviews)} reviews)</span> */}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 sm:mt-0">
        <Button className="w-full sm:w-auto">Chat</Button>
        <Button variant="outline" className="w-full sm:w-auto" aria-label="Add to favorites">
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
