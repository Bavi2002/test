import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import Script from 'next/script';
import Header from './components/Header';
import QRCodePanel from './components/QRCode';
import AboutSection from './components/AboutSection';
import DemosCarousel from './components/DemosCarousel';
import RatingSection from './components/StarRating';

interface Bot {
  id: string,
  userId: string,
  botName: string;
  description: string;
  botImage: string;
  category: string;
  demoVideoLink: string;
  publisher: string;
  averageRating: number;
  qrCodeImage: string;
  reviews: number;
  tags: string[];
  // downloads: string;
  // ageRating: string;
}

async function getBotData(slug: string): Promise<Bot | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/bots/${slug}`);
    const data = res.ok ? await res.json() : null;
    if (data) {
      data.downloads = String(data.downloads); // Ensure downloads is a string
    }
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const bot = await getBotData(slug);
  const domain = 'http://localhost:3000';
  const canonicalUrl = `${domain}/bots/${slug}`;

  if (!bot) {
    return {
      title: 'Bot Not Found',
      description: 'This bot does not exist.',
      alternates: { canonical: domain },
    };
  }

  const parentImages = (await parent).openGraph?.images || [];
  const botImage = bot.botImage.startsWith('/') ? `${domain}${bot.botImage}` : bot.botImage;

  return {
    title: `${bot.botName}`,
    description: bot.description.slice(0, 160),
    alternates: {
      canonical: canonicalUrl, // Fix: Canonical URL
    },
    openGraph: {
      type: 'website', // Fix: Add og:type
      url: canonicalUrl, // Fix: Add og:url
      title: bot.botName,
      description: bot.description.slice(0, 160),
      images: [
        {
          url: botImage,
          width: 800,
          height: 600,
          alt: bot.botName,
        },
        ...parentImages,
      ],
    },
    twitter: {
      card: 'summary_large_image', // Fix: Add Twitter Card
      title: bot.botName,
      description: bot.description.slice(0, 160),
      images: [
        {
          url: botImage,
          width: 800,
          height: 600,
          alt: bot.botName,
        },
      ],
    }
  }
}

export default async function BotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log("slug", slug);
  const bot = await getBotData(slug);
  console.log("botssss", bot);
  if (!bot) {
    notFound();
  }

  return (
    <>
      {/* Optimize critical scripts */}
      <Script
        src="http://localhost:3000/_next/static/chunks/some-script.js" // Replace with actual script
        strategy="afterInteractive"
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Header bot={bot} />

            <div className="py-6">
              <AboutSection
                description={bot.description ?? 'No description available'}
                category={bot.category ?? ""}
                tags={bot.tags ?? []}
              />
            </div>
            <DemosCarousel videos={bot.demoVideoLink ?? []} />
          </div>
          <div className="md:col-span-1">

            <QRCodePanel qr={bot.qrCodeImage} />

            <div className="mt-6">
              <RatingSection botId={bot.id} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}