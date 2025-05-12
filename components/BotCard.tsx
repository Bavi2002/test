import { Badge } from "@/components/ui/badge";
import { Heart, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface BotCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  image: string;
}

export default function BotCard({ name, description, category, rating, image, id }: BotCardProps) {
  const clampedRating = Math.min(Math.max(Math.round(rating), 1), 5);
  const stars = "★".repeat(clampedRating);
  const emptyStars = "☆".repeat(5 - clampedRating);

  return (
    <Link href={`/bots/${name}-${id}`}>
      <div className="group relative flex items-center space-x-3 p-3 sm:p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">

        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-xl flex items-center justify-center shadow-inner">

            <img
              src={image}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
          </div>


        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1">{description}</p>
          <div className="flex items-center space-x-2 sm:space-x-3 mt-1 sm:mt-2">
            <span className="flex text-yellow-400 text-sm sm:text-base">
              {stars}
              <span className="text-gray-300">{emptyStars}</span>
            </span>
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border-gray-200 bg-white text-gray-700 tracking-wider"
            >
              {category}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-1 sm:space-y-2 transition-opacity duration-200">
          <button
            className="p-1.5 sm:p-2 rounded-lg transition-colors duration-200"
            aria-label="Favorite"
          >
            <Heart
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 hover:text-rose-400 hover:fill-rose-400 transition-colors"
              stroke="currentColor"
              strokeWidth={2}
            />
          </button>
          <button
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            aria-label="More options"
          >
            <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

      </div>
    </Link>
  );
}