import { useGetHome } from "@workspace/api-client-react";
import { ContentCard, ContentCardSkeleton } from "@/components/content-card";
import { Button } from "@/components/ui/button";
import { PlayCircle, TrendingUp, Sparkles, Film, Tv, Star } from "lucide-react";
import { Link } from "wouter";
import { proxyImg } from "@/lib/utils";

type Item = { title: string; id?: string; slug?: string; image?: string; type?: string; rating?: string; episode?: string; rank?: string };

function Section({ title, icon, items }: { title: string; icon: React.ReactNode; items: Item[] }) {
  if (!items?.length) return null;
  return (
    <section className="container mx-auto px-4">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground md:text-2xl">
          {icon}
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.slice(0, 12).map((item) => (
          <ContentCard key={item.slug || item.id} slug={item.slug || item.id || ""} {...item} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { data: response, isLoading, isError } = useGetHome();

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-destructive mb-2">Gagal memuat konten</h2>
        <p className="text-muted-foreground">Coba lagi nanti.</p>
      </div>
    );
  }

  const data = (response as any)?.data as {
    top10_anime: Item[];
    top10_film: Item[];
    latest_anime: Item[];
    latest_film: Item[];
    latest_series: Item[];
    tv_show: Item[];
  } | undefined;

  if (isLoading || !data) {
    return (
      <div className="w-full space-y-12 pb-12">
        <div className="h-[60vh] md:h-[80vh] w-full bg-muted/10 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="container mx-auto px-4">
            <div className="h-7 w-48 bg-muted/20 animate-pulse rounded mb-5" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, j) => <ContentCardSkeleton key={j} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const heroItem = data.top10_anime?.[0] || data.latest_anime?.[0];

  return (
    <div className="w-full pb-20 space-y-12 md:space-y-16">
      {heroItem && (
        <div className="relative h-[55vh] md:h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={proxyImg(heroItem.image)}
              alt={heroItem.title}
              className="h-full w-full object-cover object-top opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          </div>
          <div className="container relative mx-auto flex h-full items-end px-4 pb-12 md:pb-20">
            <div className="max-w-2xl space-y-4">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/50">
                {heroItem.type || "Anime"}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl drop-shadow-lg line-clamp-2">
                {heroItem.title}
              </h1>
              {heroItem.rating && heroItem.rating !== "-" && (
                <p className="text-yellow-400 font-semibold">★ {heroItem.rating}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={`/anime/${heroItem.slug || heroItem.id}`}>
                  <Button size="lg" className="h-11 gap-2 bg-primary px-7 font-bold text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                    <PlayCircle className="h-5 w-5" />
                    Tonton Sekarang
                  </Button>
                </Link>
                <Link href={`/anime/${heroItem.slug || heroItem.id}`}>
                  <Button size="lg" variant="secondary" className="h-11 px-7 font-bold">
                    Detail
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Section title="Top 10 Anime" icon={<TrendingUp className="h-6 w-6 text-primary" />} items={data.top10_anime} />
      <Section title="Top 10 Film" icon={<Star className="h-6 w-6 text-primary" />} items={data.top10_film} />
      <Section title="Anime Terbaru" icon={<Sparkles className="h-6 w-6 text-primary" />} items={data.latest_anime} />
      <Section title="Film Terbaru" icon={<Film className="h-6 w-6 text-primary" />} items={data.latest_film} />
      <Section title="Series Terbaru" icon={<Tv className="h-6 w-6 text-primary" />} items={data.latest_series} />
      <Section title="TV Show" icon={<Tv className="h-6 w-6 text-primary" />} items={data.tv_show} />
    </div>
  );
}
