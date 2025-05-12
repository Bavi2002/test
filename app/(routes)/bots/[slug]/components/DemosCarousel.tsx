"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface DemosCarouselProps {
  videos: string; // array of YouTube links
}

const getYoutubeEmbedUrl = (url: string) => {
  try {
    const parsed = new URL(url);

    // Handle YouTube Shorts links
    if (parsed.hostname === "youtube.com" && parsed.pathname.startsWith("/shorts/")) {
      const videoId = parsed.pathname.split("/shorts/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Handle "youtu.be" and "youtube.com/watch?v="
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    const videoId = parsed.searchParams.get("v");
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
};

export default function DemosCarousel({ videos }: DemosCarouselProps) {
  const embedUrl = getYoutubeEmbedUrl(videos);
          if (!embedUrl) return null;
  return (
    <section className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">Demo Videos</h2>

      <Swiper
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
        className="rounded-xl"
      >
        
          

          
            <SwiperSlide>
              <div className="aspect-video rounded-xl overflow-hidden shadow">
                <iframe
                  src={embedUrl}
                  title={`YouTube video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full"
                ></iframe>
              </div>
            </SwiperSlide>
        
        
      </Swiper>
    </section>
  );
}
