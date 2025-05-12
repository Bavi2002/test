"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Bot {
  id: string;
  botName: string;
  description: string;
  demoVideoLink: string;
  qrCodeImage: string;
  averageRating: number;
  botImage: string;
  category: string;
  rating: number;
}

export default function Home() {
  const [sortType, setSortType] = useState<
    "alphabetical" | "category" | "rating" | null
  >(null);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const pageSize = 8;

  async function fetchBots(cursor: string | null = null, direction: 'next' | 'prev' | 'initial' = 'initial') {
    if (loading) return;
    setLoading(true);
    try {
      const url = cursor ? `/api/home-bots?cursor=${cursor}&page=${pageSize}` : `/api/home-bots?page=${pageSize}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch bots");

      const { bots: fetchedBots, totalItems: fetchedTotal, nextCursor } = await response.json();
      const mappedBots: Bot[] = fetchedBots.map((bot: Bot) => ({
        id: bot.id,
        botName: bot.botName,
        description: bot.description,
        category: bot.category || "General",
        rating: bot.averageRating || 0,
        demoVideoLink: bot.demoVideoLink || "",
        qrCodeImage: bot.qrCodeImage || "",
        botImage: bot.botImage || "",
      }));

      console.log("Fetched bots:", mappedBots);
      setBots(mappedBots);
      setTotalItems(fetchedTotal);
      setNextCursor(nextCursor);
      setCurrentCursor(cursor);

      if (direction === 'next') {
        setCurrentPage((prev) => prev + 1);
        setPrevCursors((prev) => [...prev, currentCursor || ""]);
      } else if (direction === 'prev' && prevCursors.length > 0) {
        setCurrentPage((prev) => prev - 1);
        setPrevCursors((prev) => prev.slice(0, -1));
      } else if (direction === 'initial') {
        setCurrentPage(1);
        setPrevCursors([]);
      }
    } catch (error) {
      console.error("Error fetching bots:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBots(null, 'initial');
  }, []);

  const handleNext = () => {
    if (nextCursor && !loading) {
      fetchBots(nextCursor, 'next');
    }
  };

  const handlePrevious = () => {
    if (loading || prevCursors.length === 0) return;
    const lastCursor = prevCursors[prevCursors.length - 1];
    fetchBots(lastCursor || null, 'prev');
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const handleSort = (type: "alphabetical" | "category" | "rating" | null) => {
    setSortType(type);
    setCurrentCursor(null);
    setCurrentPage(1);
    setPrevCursors([]);
    setNextCursor(null);
    fetchBots(null, 'initial');
  };

  const filteredBots = useMemo(() => {
    const result = [...bots];

    if (sortType === "alphabetical") {
      result.sort((a: Bot, b: Bot) =>
        (a.botName || "").localeCompare(b.botName || "")
      );
    } else if (sortType === "category") {
      result.sort((a: Bot, b: Bot) => {
        const aCategory = a.category || "General";
        const bCategory = b.category || "General";
        if (aCategory === bCategory) {
          return (a.botName || "").localeCompare(b.botName || "");
        }
        return aCategory.localeCompare(bCategory);
      });
    } else if (sortType === "rating") {
      result.sort((a: Bot, b: Bot) => {
        if (a.rating === b.rating) {
          return (a.botName || "").localeCompare(b.botName || "");
        }
        return b.rating - a.rating;
      });
    }

    return result;
  }, [sortType, bots]);

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="sticky top-0 z-10 backdrop-blur-sm px-6 py-4 w-full items-center">
        <div className="max-w-7xl mx-auto ">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg">
              Top-free
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all border border-gray-200 shadow-sm hover:shadow-md">
              Top-paid
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all border border-gray-200 shadow-sm hover:shadow-md">
              Top-grossing
            </button>
            <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1"></div>
            <button
              onClick={() => handleSort("alphabetical")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border shadow-sm ${sortType === "alphabetical"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
            >
              Sort A-Z
            </button>
            <button
              onClick={() => handleSort("category")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border shadow-sm ${sortType === "category"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
            >
              Sort by Category
            </button>
            <button
              onClick={() => handleSort("rating")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border shadow-sm ${sortType === "rating"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
            >
              Rating
            </button>
            <button
              onClick={() => handleSort(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border shadow-sm ${sortType === null
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-transparent"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 md:px-8 overflow-y-auto w-full">
        {loading ? (
          <p className="text-gray-600 text-center text-sm sm:text-base md:text-lg">
            Loading...
          </p>
        ) : filteredBots.length === 0 ? (
          <p className="text-gray-600 text-center text-sm sm:text-base md:text-lg">
            No bots found.
          </p>
        ) : (
          <div className="max-w-full sm:max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
              {filteredBots.map((bot, index) => {
                const clampedRating = Math.min(
                  Math.max(Math.round(bot.rating || 0), 0),
                  5
                );
                const filledStars = "★".repeat(clampedRating);
                const emptyStars = "☆".repeat(5 - clampedRating);
                const starDisplay = bot.rating
                  ? `${filledStars}${emptyStars}`
                  : `${emptyStars}`;

                return (
                  <div
                    key={`${bot.botName}-${index}`}
                    className="border m-2 hover:bg-gray-50 rounded-2xl w-full max-w-full"
                  >
                    <Link href={`/bots/${bot.botName}-${bot.id}`}>
                      <div className="p-2 sm:p-3 md:p-4 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                          <div className="w-9 h-10 sm:w-12 sm:h-12 md:w-28 md:h-28 lg:w-28 lg:h-28 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-md flex items-center justify-center shadow-inner flex-shrink-0">
                            <img
                              src={bot.botImage}
                              alt={bot.botName}
                              className="w-full h-full object-cover rounded-md shadow-md"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base md:text-lg text-black">
                              {bot.botName}
                            </p>
                            <p
                              className={cn(
                                "text-xs sm:text-sm md:text-base text-gray-500 line-clamp-3"
                              )}
                            >
                              {bot.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 min-w-[100px]">
                          <span className="px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm md:text-base lg:text-xs">
                            {bot.category}
                          </span>
                          <span
                            className="text-xs sm:text-sm md:text-base text-yellow-500"
                            aria-label={`Rating: ${bot.rating || 0} out of 5 stars`}
                          >
                            {starDisplay}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {filteredBots.length !== 0 && (
        <div className="py-4 bg-white px-4 sm:px-6 md:px-8 w-full cursor-pointer">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={currentPage === 1 || loading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="text-lg">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  className={currentPage >= totalPages || !nextCursor || loading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

