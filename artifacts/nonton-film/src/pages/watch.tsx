import { useState } from "react";
import { useParams } from "wouter";
import { useGetEpisodeDetail } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Download, ChevronLeft, ChevronRight, ExternalLink, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DownloadLink = { server: string; url: string };
type DownloadGroup = { resolution: string; links: DownloadLink[] };
type StreamLink = { server: string; url?: string; embed?: string };
type NavItem = { title: string; slug?: string; id?: string };
type EpItem = { title: string; slug?: string; id?: string };

export default function Watch() {
  const { slug } = useParams<{ slug: string }>();
  const { data: response, isLoading, isError } = useGetEpisodeDetail(slug!);
  const [activeStream, setActiveStream] = useState(0);
  const [activeResolution, setActiveResolution] = useState(0);

  if (isError) return (
    <div className="flex h-[50vh] items-center justify-center text-destructive">
      Gagal memuat episode.
    </div>
  );

  const d = (response as any)?.data as {
    title: string;
    downloads?: DownloadGroup[];
    streams?: StreamLink[];
    navigation?: { prev?: NavItem; next?: NavItem };
    all_episodes?: EpItem[];
    embed_note?: string;
  } | undefined;

  if (isLoading || !d) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full aspect-video bg-muted/20 animate-pulse rounded-xl mb-6" />
        <div className="space-y-3">
          <div className="h-6 w-64 bg-muted/20 animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted/20 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  const streams: StreamLink[] = d.streams || [];
  const downloads: DownloadGroup[] = d.downloads || [];
  const nav = d.navigation || {};
  const allEpisodes: EpItem[] = d.all_episodes || [];

  const currentStream = streams[activeStream];
  const embedSrc = currentStream?.embed || currentStream?.url;

  return (
    <div className="container mx-auto px-4 py-6 pb-16 max-w-6xl">
      <h1 className="text-2xl font-bold text-white mb-4 line-clamp-2">{d.title}</h1>

      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl mb-4">
        {embedSrc ? (
          <iframe
            key={embedSrc}
            src={embedSrc}
            className="w-full h-full"
            allowFullScreen
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <PlayCircle className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-sm">
              {streams.length > 0 ? "Pilih server di bawah untuk menonton" : "Streaming tidak tersedia. Gunakan link download di bawah."}
            </p>
          </div>
        )}
      </div>

      {streams.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm text-muted-foreground self-center mr-1">Server:</span>
          {streams.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveStream(i)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium border transition-all",
                activeStream === i
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary"
              )}
            >
              {s.server || `Server ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mb-6 gap-3">
        {nav.prev ? (
          <Link href={`/watch/${nav.prev.slug || nav.prev.id}`}>
            <Button variant="outline" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              {nav.prev.title || "Sebelumnya"}
            </Button>
          </Link>
        ) : <div />}
        {nav.next ? (
          <Link href={`/watch/${nav.next.slug || nav.next.id}`}>
            <Button variant="outline" className="gap-1">
              {nav.next.title || "Berikutnya"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : <div />}
      </div>

      {downloads.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 mb-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Download
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {downloads.map((dl, i) => (
              <button
                key={i}
                onClick={() => setActiveResolution(i)}
                className={cn(
                  "rounded-full px-4 py-1 text-sm font-semibold border transition-all",
                  activeResolution === i
                    ? "bg-primary text-white border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary"
                )}
              >
                {dl.resolution}
              </button>
            ))}
          </div>
          {downloads[activeResolution] && (
            <div className="flex flex-wrap gap-2">
              {downloads[activeResolution].links.map((link) => (
                <a
                  key={link.server}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 text-sm text-primary font-medium hover:bg-primary hover:text-white transition-all"
                >
                  {link.server}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {allEpisodes.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Semua Episode</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {allEpisodes.map((ep) => {
              const epSlug = ep.slug || ep.id || "";
              const isActive = epSlug === slug;
              return (
                <Link key={epSlug} href={`/watch/${epSlug}`}>
                  <div className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-card text-white border-border hover:border-primary hover:bg-primary/10"
                  )}>
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
