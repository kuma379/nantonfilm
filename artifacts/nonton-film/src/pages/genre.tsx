import { useGetGenres } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Tag } from "lucide-react";

type GenreItem = { name: string; slug: string; count?: number };

export default function Genre() {
  const { data: response, isLoading, isError } = useGetGenres();
  const genres: GenreItem[] = (response as any)?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
        <Tag className="h-8 w-8 text-primary" />
        Genre
      </h1>
      {isError && <p className="text-destructive text-center py-12">Gagal memuat genre.</p>}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {genres.map((g) => (
            <Link
              key={g.slug}
              href={`/genre/${g.slug}`}
              className="flex items-center justify-between rounded-xl bg-card border border-border px-4 py-3 hover:border-primary hover:bg-primary/10 transition-all duration-200 group"
            >
              <span className="font-semibold text-white group-hover:text-primary transition-colors">{g.name}</span>
              {g.count !== undefined && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{g.count}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
