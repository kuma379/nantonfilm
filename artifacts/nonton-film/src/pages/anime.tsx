import { useState } from "react";
import { useGetAnimeDonghua } from "@workspace/api-client-react";
import { ContentCard, ContentCardSkeleton } from "@/components/content-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Item = { title: string; slug?: string; id?: string; image?: string; type?: string; rating?: string; episode?: string };

export default function Anime() {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isError } = useGetAnimeDonghua({ page });
  const items: Item[] = (response as any)?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Anime & Donghua</h1>
      {isError && <p className="text-destructive text-center py-12">Gagal memuat data. Coba lagi.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 18 }).map((_, i) => <ContentCardSkeleton key={i} />)
          : items.map((item) => (
              <ContentCard key={item.slug || item.id} slug={item.slug || item.id || ""} {...item} />
            ))}
      </div>
      {!isLoading && items.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <span className="text-muted-foreground text-sm">Halaman {page}</span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={items.length < 10}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
