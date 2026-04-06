import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const BASE_URL = "https://www.sankavollerei.com/anime/winbu";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://winbu.net/",
  },
  decompress: true,
});

interface CacheEntry {
  data: unknown;
  expires: number;
  contentType?: string;
  buffer?: string;
}

const cache = new Map<string, CacheEntry>();

const TTL = {
  home: 5 * 60 * 1000,
  genres: 60 * 60 * 1000,
  detail: 10 * 60 * 1000,
  list: 3 * 60 * 1000,
  episode: 5 * 60 * 1000,
  search: 2 * 60 * 1000,
  image: 10 * 60 * 1000,
};

function getCache(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { cache.delete(key); return null; }
  return entry;
}

function setCache(key: string, entry: CacheEntry) {
  cache.set(key, entry);
}

async function fetchJSON(path: string, params?: Record<string, string | number | undefined>): Promise<unknown> {
  const cleanParams: Record<string, string | number> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && String(v) !== "") cleanParams[k] = v;
    }
  }
  const res = await api.get(path, { params: cleanParams });
  return res.data;
}

function normalizeList(data: unknown): unknown[] {
  if (!data) return [];
  const arr: unknown[] = Array.isArray(data) ? data : Object.values(data as object);
  return arr.map((item: unknown) => {
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      return { ...obj, slug: obj.id || obj.slug };
    }
    return item;
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathSegments = (req.query.path as string[]) || [];
  const path = "/" + pathSegments.join("/");
  const query = req.query as Record<string, string>;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  try {
    // Image proxy
    if (path === "/img") {
      const { url } = query;
      if (!url) { res.status(400).send("Missing url"); return; }
      const cacheKey = `img:${url}`;
      const cached = getCache(cacheKey);
      if (cached?.buffer) {
        res.setHeader("Content-Type", cached.contentType!);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(Buffer.from(cached.buffer, "base64"));
        return;
      }
      try {
        const imgRes = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 12000,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://winbu.net/",
            "Accept": "image/*,*/*;q=0.8",
          },
        });
        const contentType = String(imgRes.headers["content-type"] || "image/jpeg");
        const buf = Buffer.from(imgRes.data);
        setCache(cacheKey, { data: null, expires: Date.now() + TTL.image, contentType, buffer: buf.toString("base64") });
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(buf);
      } catch {
        res.status(404).send("Image not found");
      }
      return;
    }

    // Home
    if (path === "/home") {
      const cacheKey = "home";
      const cached = getCache(cacheKey);
      if (cached) { res.json({ ok: true, data: cached.data }); return; }
      const raw = await fetchJSON("/home") as any;
      const inner = raw?.data || {};
      const data = {
        top10_anime: normalizeList(inner.top10_anime),
        top10_film: normalizeList(inner.top10_film),
        latest_anime: normalizeList(inner.latest_anime),
        latest_film: normalizeList(inner.latest_film),
        latest_series: normalizeList(inner.latest_series),
        tv_show: normalizeList(inner.tv_show),
      };
      setCache(cacheKey, { data, expires: Date.now() + TTL.home });
      res.json({ ok: true, data });
      return;
    }

    // Search
    if (path === "/search") {
      const cacheKey = `search:${query.q}:${query.page || 1}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json(cached.data); return; }
      const raw = await fetchJSON("/search", { q: query.q, page: query.page ? Number(query.page) : 1 }) as any;
      const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
      setCache(cacheKey, { data: result, expires: Date.now() + TTL.search });
      res.json(result);
      return;
    }

    // Genres list
    if (path === "/genres") {
      const cacheKey = "genres";
      const cached = getCache(cacheKey);
      if (cached) { res.json({ ok: true, data: cached.data }); return; }
      const raw = await fetchJSON("/genres") as any;
      const data = normalizeList(raw?.data);
      setCache(cacheKey, { data, expires: Date.now() + TTL.genres });
      res.json({ ok: true, data });
      return;
    }

    // Schedule
    if (path === "/schedule") {
      const cacheKey = `schedule:${query.day || "all"}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json({ ok: true, data: cached.data }); return; }
      const raw = await fetchJSON("/schedule", { day: query.day }) as any;
      const d = raw?.data;
      const result = typeof d === "object" && !Array.isArray(d) ? d : normalizeList(d);
      setCache(cacheKey, { data: result, expires: Date.now() + TTL.list });
      res.json({ ok: true, data: result });
      return;
    }

    // Paginated list endpoints
    const LIST_PATHS = ["/animedonghua", "/film", "/series", "/tvshow", "/others", "/ongoing", "/completed", "/populer", "/all-anime", "/update", "/latest"];
    if (LIST_PATHS.includes(path)) {
      const cacheKey = `${path.slice(1)}:${query.page || 1}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json(cached.data); return; }
      const raw = await fetchJSON(path, { page: query.page ? Number(query.page) : 1 }) as any;
      const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
      setCache(cacheKey, { data: result, expires: Date.now() + TTL.list });
      res.json(result);
      return;
    }

    // Catalog
    if (path === "/catalog") {
      const { title, page, order, type, status } = query;
      const cacheKey = `catalog:${title}:${page || 1}:${order}:${type}:${status}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json(cached.data); return; }
      const raw = await fetchJSON("/catalog", { title, page: page ? Number(page) : 1, order, type, status }) as any;
      const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
      setCache(cacheKey, { data: result, expires: Date.now() + TTL.list });
      res.json(result);
      return;
    }

    // Genre detail
    if (pathSegments[0] === "genre" && pathSegments[1]) {
      const slug = pathSegments[1];
      const cacheKey = `genre:${slug}:${query.page || 1}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json(cached.data); return; }
      const raw = await fetchJSON(`/genre/${slug}`, { page: query.page ? Number(query.page) : 1 }) as any;
      const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
      setCache(cacheKey, { data: result, expires: Date.now() + TTL.list });
      res.json(result);
      return;
    }

    // Anime detail
    if (pathSegments[0] === "anime" && pathSegments[1]) {
      const slug = pathSegments[1];
      const cacheKey = `anime:${slug}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json({ ok: true, data: cached.data }); return; }
      const raw = await fetchJSON(`/anime/${slug}`) as any;
      const d = raw?.data || {};
      const data = {
        ...d,
        episodes: normalizeList(d.episodes).map((ep: unknown) => {
          const e = ep as Record<string, unknown>;
          return { ...e, slug: e.id || e.slug };
        }),
        recommendations: normalizeList(d.recommendations),
      };
      setCache(cacheKey, { data, expires: Date.now() + TTL.detail });
      res.json({ ok: true, data });
      return;
    }

    // Episode detail (for watch page)
    if (pathSegments[0] === "episode" && pathSegments[1]) {
      const slug = pathSegments[1];
      const cacheKey = `episode:${slug}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json({ ok: true, data: cached.data }); return; }
      const raw = await fetchJSON(`/episode/${slug}`) as any;
      const data = raw?.data || {};
      setCache(cacheKey, { data, expires: Date.now() + TTL.episode });
      res.json({ ok: true, data });
      return;
    }

    // Series detail
    if (pathSegments[0] === "series" && pathSegments[1]) {
      const slug = pathSegments[1];
      const cacheKey = `series:detail:${slug}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json({ ok: true, data: cached.data }); return; }
      const raw = await fetchJSON(`/series/${slug}`) as any;
      const d = raw?.data || {};
      const data = {
        ...d,
        episodes: normalizeList(d.episodes).map((ep: unknown) => {
          const e = ep as Record<string, unknown>;
          return { ...e, slug: e.id || e.slug };
        }),
      };
      setCache(cacheKey, { data, expires: Date.now() + TTL.detail });
      res.json({ ok: true, data });
      return;
    }

    // Film detail
    if (pathSegments[0] === "film" && pathSegments[1]) {
      const slug = pathSegments[1];
      const cacheKey = `film:detail:${slug}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json({ ok: true, data: cached.data }); return; }
      const raw = await fetchJSON(`/film/${slug}`) as any;
      const data = raw?.data || null;
      if (data) setCache(cacheKey, { data, expires: Date.now() + TTL.detail });
      res.json({ ok: true, data });
      return;
    }

    // Server/embed
    if (path === "/server") {
      const cacheKey = `server:${query.post}:${query.nume}:${query.type}`;
      const cached = getCache(cacheKey);
      if (cached) { res.json({ ok: true, data: cached.data }); return; }
      const raw = await fetchJSON("/server", { post: query.post, nume: query.nume, type: query.type });
      setCache(cacheKey, { data: raw, expires: Date.now() + TTL.episode });
      res.json({ ok: true, data: raw });
      return;
    }

    res.status(404).json({ ok: false, error: "Not found" });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("API error:", message);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
}
