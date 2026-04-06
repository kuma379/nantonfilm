import { useParams } from "wouter";
import { useGetFilmDetail } from "@workspace/api-client-react";
import { proxyImg } from "@/lib/utils";
import { Link } from "wouter";
import { Play, Star, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type GenreItem = { name: string };

export default function FilmDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: response, isLoading, isError } = useGetFilmDetail(slug!);

  if (isError) return (
    <div className="flex h-[50vh] items-center justify-center text-destructive">Gagal memuat detail.</div>
  );

  const d = (response as any)?.data as {
    title: string;
    image: string;
    synopsis?: string;
    info?: { rating?: string; genres?: GenreItem[]; status?: string; duration?: string; release_date?: string };
    episodes?: { title: string; slug?: string; id?: string }[];
    downloads?: { resolution: string; links: { server: string; url: string }[] }[];
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
          <img src={proxyImg(d.image)} alt={d.title} className="w-full rounded-xl shadow-2xl aspect-[2/3] object-cover" />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-white">{d.title}</h1>

          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Link key={g.name} href={`/genre/${g.name.toLowerCase()}`}>
                <Badge className="bg-primary/20 text-primary border-primary/30 cursor-pointer">{g.name}</Badge>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {info.rating && info.rating !== "-" && (
              <div className="flex items-center gap-2 text-yellow-400"><Star className="h-4 w-4" /> {info.rating}</div>
            )}
            {info.duration && info.duration !== "-" && (
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> <span className="text-white">{info.duration}</span></div>
            )}
            {info.release_date && info.release_date !== "-" && (
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> <span className="text-white">{info.release_date}</span></div>
            )}
          </div>

          {d.synopsis && (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">{d.synopsis}</p>
          )}

          {d.episodes && d.episodes.length > 0 && (
            <div className="pt-2">
              <Link href={`/watch/${d.episodes[0].slug || d.episodes[0].id}`}>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-white font-semibold hover:bg-primary/90 transition-all">
                  <Play className="h-4 w-4" /> Tonton Film
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
