import { Link } from "wouter";
import { PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { proxyImg } from "@/lib/utils";

interface ContentCardProps {
  title: string;
  image?: string;
  slug: string;
  type?: string;
  status?: string;
  episode?: string;
  rating?: string;
  rank?: string;
  hrefPrefix?: string;
}

export function ContentCard({ title, image, slug, type, status, episode, rating, rank, hrefPrefix }: ContentCardProps) {
  let href = `/anime/${slug}`;
  if (hrefPrefix) {
    href = `${hrefPrefix}/${slug}`;
  } else if (type === "movie" || type === "film") {
    href = `/film/${slug}`;
  } else if (type === "series") {
    href = `/series/${slug}`;
  } else if (type === "tv" || type === "tvshow") {
    href = `/tvshow/${slug}`;
  }

  return (
    <Link href={href} className="group relative block w-full overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:-translate-y-1">
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted relative">
        <img
          src={proxyImg(image)}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <PlayCircle className="h-14 w-14 text-primary drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
        </div>

        {rank && (
          <div className="absolute top-2 left-2 h-8 w-8 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-lg">
            {rank.replace("#", "")}
          </div>
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {type && !rank && (
            <Badge className="bg-primary text-primary-foreground border-none font-semibold shadow-md">
              {type}
            </Badge>
          )}
          {rating && rating !== "-" && (
            <Badge className="bg-black/70 text-yellow-400 border-none">
              ★ {rating}
            </Badge>
          )}
          {status && (
            <Badge className={`border-none ${status.toLowerCase() === "completed" ? "bg-green-600/80 text-white" : "bg-blue-600/80 text-white"}`}>
              {status}
            </Badge>
          )}
          {episode && (
            <Badge className="bg-black/70 text-white border-none text-xs">
              {episode}
            </Badge>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-3">
          <h3 className="line-clamp-2 text-xs font-bold leading-tight text-white drop-shadow-md sm:text-sm">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export function ContentCardSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-xl bg-card overflow-hidden">
      <div className="aspect-[2/3] w-full bg-muted/30 rounded-xl"></div>
    </div>
  );
}
