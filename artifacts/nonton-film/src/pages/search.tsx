import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSearchContent } from "@workspace/api-client-react";
import { ContentCard, ContentCardSkeleton } from "@/components/content-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

type Item = { title: string; slug?: string; id?: string; image?: string; type?: string; rating?: string; episode?: string };

export default function Search() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [submitted, setSubmitted] = useState(initialQ);

  const { data: response, isLoading } = useSearchContent(
    { q: submitted },
    { query: { enabled: submitted.length > 1 } }
  );

  const items: Item[] = (response as any)?.data || [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(query.trim());
  }

  useEffect(() => {
    if (initialQ) setSubmitted(initialQ);
  }, [initialQ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Cari Konten</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8 max-w-xl">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari anime, film, series..."
          className="h-11 bg-card border-border text-white placeholder:text-muted-foreground"
        />
        <Button type="submit" className="h-11 px-6 bg-primary">
          <SearchIcon className="h-4 w-4" />
        </Button>
      </form>

      {submitted && (
        <>
          {isLoading && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => <ContentCardSkeleton key={i} />)}
            </div>
          )}
          {!isLoading && items.length === 0 && (
            <p className="text-muted-foreground text-center py-12">
              Tidak ditemukan hasil untuk "<strong className="text-white">{submitted}</strong>"
            </p>
          )}
          {!isLoading && items.length > 0 && (
            <>
              <p className="text-muted-foreground mb-4 text-sm">
                Menampilkan hasil untuk "<strong className="text-white">{submitted}</strong>" — {items.length} hasil
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {items.map((item) => (
                  <ContentCard key={item.slug || item.id} slug={item.slug || item.id || ""} {...item} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {!submitted && (
        <p className="text-muted-foreground text-center py-16">Ketik nama anime atau film untuk mulai mencari.</p>
      )}
    </div>
  );
}
