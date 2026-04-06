import { useState } from "react";
import { useGetSchedule } from "@workspace/api-client-react";
import { ContentCard, ContentCardSkeleton } from "@/components/content-card";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = [
  { key: "senin", label: "Senin" },
  { key: "selasa", label: "Selasa" },
  { key: "rabu", label: "Rabu" },
  { key: "kamis", label: "Kamis" },
  { key: "jumat", label: "Jumat" },
  { key: "sabtu", label: "Sabtu" },
  { key: "minggu", label: "Minggu" },
];

type Item = { title: string; slug?: string; id?: string; image?: string; type?: string; rating?: string; episode?: string };

export default function Schedule() {
  const todayIdx = new Date().getDay();
  const defaultDay = DAYS[todayIdx === 0 ? 6 : todayIdx - 1]?.key || "senin";
  const [day, setDay] = useState(defaultDay);
  const { data: response, isLoading, isError } = useGetSchedule({ day });

  const raw = (response as any)?.data;
  const items: Item[] = Array.isArray(raw) ? raw : raw ? Object.values(raw) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
        <CalendarDays className="h-8 w-8 text-primary" />
        Jadwal Tayang
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {DAYS.map((d) => (
          <button
            key={d.key}
            onClick={() => setDay(d.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all border",
              day === d.key
                ? "bg-primary text-white border-primary shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                : "bg-card text-muted-foreground border-border hover:border-primary hover:text-white"
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      {isError && <p className="text-destructive text-center py-12">Gagal memuat jadwal.</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <ContentCardSkeleton key={i} />)
          : items.length > 0
          ? items.map((item) => (
              <ContentCard key={item.slug || item.id} slug={item.slug || item.id || ""} {...item} />
            ))
          : <p className="col-span-full text-center text-muted-foreground py-12">Tidak ada jadwal untuk hari ini.</p>
        }
      </div>
    </div>
  );
}
