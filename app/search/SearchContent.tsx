'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import BotCard from '@/components/BotCard';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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

export default function SearchContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [bots, setBots] = useState<Bot[]>([]);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [prevCursors, setPrevCursors] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const botsPerPage = 2;

  const fetchBots = async (cursor: string | null = null, direction: 'next' | 'prev' | 'initial' = 'initial') => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const url = cursor
        ? `/api/home-bots?cursor=${cursor}&q=${encodeURIComponent(searchQuery)}&page=${botsPerPage}`
        : `/api/home-bots?q=${encodeURIComponent(searchQuery)}&page=${botsPerPage}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bots');
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      const mappedBots: Bot[] = data.bots.map((bot: Bot) => ({
        id: bot.id,
        botName: bot.botName,
        description: bot.description,
        category: bot.category || 'General',
        rating: bot.averageRating || 0,
        demoVideoLink: bot.demoVideoLink || '',
        averageRating: bot.averageRating || 0,
        qrCodeImage: bot.qrCodeImage || '',
        botImage: bot.botImage || '',
      }));

      console.log('Fetched bots:', mappedBots);
      setBots(mappedBots);
      setTotalItems(data.totalItems);
      setNextCursor(data.nextCursor);
      setCurrentCursor(cursor);

      if (direction === 'next') {
        setCurrentPage((prev) => prev + 1);
        setPrevCursors((prev) => [...prev, currentCursor || '']);
      } else if (direction === 'prev' && prevCursors.length > 0) {
        setCurrentPage((prev) => prev - 1);
        setPrevCursors((prev) => prev.slice(0, -1));
      } else if (direction === 'initial') {
        setCurrentPage(1);
        setPrevCursors([]);
      }
    } catch (err) {
      console.error('Error fetching bots:', err);
      setError('Failed to load bots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots(null, 'initial');
  }, [searchQuery]);

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

  const totalPages = Math.ceil(totalItems / botsPerPage);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 px-4 py-4 overflow-hidden">
        {loading ? (
          <p className="text-gray-600 text-center text-base mt-8">Loading...</p>
        ) : error ? (
          <p className="text-red-600 text-center text-base mt-8">{error}</p>
        ) : bots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bots.map((bot) => (
              <BotCard
                key={bot.id}
                id={bot.id}
                image={bot.botImage}
                name={bot.botName}
                description={bot.description}
                category={bot.category}
                rating={bot.rating}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 text-center text-base mt-8">
            No bots found matching &quot;{searchQuery}&quot;. Try a different query.
          </p>
        )}
      </div>

      {totalItems > 0 && (
        <div className="py-4 bg-white px-4 sm:px-6 md:px-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={currentPage === 1 || loading ? 'pointer-events-none opacity-50' : ''}
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
                  className={currentPage >= totalPages || !nextCursor || loading ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}