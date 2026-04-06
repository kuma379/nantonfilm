import { useParams } from "wouter";
import { useGetAnimeDetail } from "@workspace/api-client-react";
import { ContentCard } from "@/components/content-card";
import { Link } from "wouter";
import { proxyImg } from "@/lib/utils";
import { Play, Star, Calendar, Clock, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Episode = { title: string; slug?: string; id?: string; link?: string };
type GenreItem = { name: string; url?: string };

export default function AnimeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: response, isLoading, isError } = useGetAnimeDetail(slug!);

  if (isError) return (
    <div className="flex h-[50vh] items-center justify-center text-destructive">Gagal memuat detail.</div>
  );

  const d = (response as any)?.data as {
    title: string;
    image: string;
    synopsis: string;
    info: { rating?: string; season?: string; genres?: GenreItem[]; status?: string; type?: string; episodes_count?: string; duration?: string; studio?: string; release_date?: string };
    episodes: Episode[];
    recommendations: unknown[];
  } | undefined;

  if (isLoading || !d) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-56 aspect-[2/3] rounded-xl bg-muted/20 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-5 w-3/4 bg-muted/20 animate-pulse rounded" />)}
          </div>
        </div>
      </div>
    );
  }

  const info = d.info || {};
  const genres: GenreItem[] = info.genres || [];

  return (
    <div className="container mx-auto px-4 py-8 pb-16">
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-shrink-0 w-48 md:w-56">
          <img
            src={proxyImg(d.image)}
            alt={d.title}
            className="w-full rounded-xl shadow-2xl aspect-[2/3] object-cover"
          />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-white leading-tight">{d.title}</h1>

          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Link key={g.name} href={`/genre/${g.name.toLowerCase()}`}>
                <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/40 cursor-pointer">
                  {g.name}
                </Badge>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {info.rating && info.rating !== "-" && (
              <div className="flex items-center gap-2 text-yellow-400">
                <Star className="h-4 w-4" /> Rating: {info.rating}
              </div>
            )}
            {info.status && info.status !== "-" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tv className="h-4 w-4" /> Status: <span className="text-white">{info.status}</span>
              </div>
            )}
            {info.type && info.type !== "-" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tv className="h-4 w-4" /> Tipe: <span className="text-white">{info.type}</span>
              </div>
            )}
            {info.season && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" /> Season: <span className="text-white">{info.season}</span>
              </div>
            )}
            {info.duration && info.duration !== "-" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" /> Durasi: <span className="text-white">{info.duration}</span>
              </div>
            )}
            {info.studio && info.studio !== "-" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                Studio: <span className="text-white">{info.studio}</span>
              </div>
            )}
          </div>

          {d.synopsis && (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl line-clamp-4">{d.synopsis}</p>
          )}
        </div>
      </div>

      {d.episodes && d.episodes.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">Episode ({d.episodes.length})</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {d.episodes.map((ep) => {
              const epSlug = ep.slug || ep.id || "";
              return (
                <Link key={epSlug} href={`/watch/${epSlug}`}>
                  <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2.5 text-sm font-medium text-white hover:border-primary hover:bg-primary/10 transition-all group cursor-pointer">
                    <Play className="h-3.5 w-3.5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="line-clamp-1">{ep.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {d.recommendations && (d.recommendations as unknown[]).length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Rekomendasi</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {(d.recommendations as unknown[]).slice(0, 12).map((item: unknown) => {
              const i = item as { title: string; slug?: string; id?: string; image?: string; type?: string; rating?: string };
              return <ContentCard key={i.slug || i.id} slug={i.slug || i.id || ""} {...i} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
