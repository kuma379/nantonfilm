import { useParams } from "wouter";
import { useGetSeriesDetail } from "@workspace/api-client-react";
import { proxyImg } from "@/lib/utils";
import { Link } from "wouter";
import { Play, Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type GenreItem = { name: string };

export default function SeriesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: response, isLoading, isError } = useGetSeriesDetail(slug!);

  if (isError) return (
    <div className="flex h-[50vh] items-center justify-center text-destructive">Gagal memuat detail.</div>
  );

  const d = (response as any)?.data as {
    title: string;
    image: string;
    synopsis?: string;
    info?: { rating?: string; genres?: GenreItem[]; status?: string; duration?: string };
    episodes?: { title: string; slug?: string; id?: string }[];
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
  const episodes = d.episodes || [];

  return (
    <div className="container mx-auto px-4 py-8 pb-16">
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="flex-shrink-0 w-48 md:w-56">
          <img src={proxyImg(d.image)} alt={d.title} className="w-full rounded-xl shadow-2xl aspect-[2/3] object-cover" />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-white">{d.title}</h1>

          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Badge key={g.name} className="bg-primary/20 text-primary border-primary/30">{g.name}</Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {info.rating && info.rating !== "-" && (
              <span className="flex items-center gap-1 text-yellow-400"><Star className="h-4 w-4" /> {info.rating}</span>
            )}
            {info.duration && info.duration !== "-" && (
              <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" /> <span className="text-white">{info.duration}</span></span>
            )}
          </div>

          {d.synopsis && (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">{d.synopsis}</p>
          )}
        </div>
      </div>

      {episodes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Episode ({episodes.length})</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {episodes.map((ep) => {
              const epSlug = ep.slug || ep.id || "";
              return (
                <Link key={epSlug} href={`/watch/${epSlug}`}>
                  <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2.5 text-sm font-medium text-white hover:border-primary hover:bg-primary/10 transition-all group cursor-pointer">
                    <Play className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="line-clamp-1">{ep.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
