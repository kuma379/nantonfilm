import { Router } from "express";
import axios from "axios";

const router = Router();
const BASE_URL = "https://www.sankavollerei.com/anime/winbu";

interface CacheEntry {
  data: unknown;
  expires: number;
}

const cache = new Map<string, CacheEntry>();

const TTL = {
  home: 5 * 60 * 1000,
  genres: 60 * 60 * 1000,
  detail: 10 * 60 * 1000,
  list: 3 * 60 * 1000,
  episode: 5 * 60 * 1000,
  search: 2 * 60 * 1000,
};

function getCache(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown, ttl: number) {
  cache.set(key, { data, expires: Date.now() + ttl });
}

async function fetchAPI(path: string, params?: Record<string, string | number | undefined>) {
  const cleanParams: Record<string, string | number> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") cleanParams[k] = v;
    }
  }
  const res = await axios.get(`${BASE_URL}${path}`, {
    params: cleanParams,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Referer": "https://winbu.net/",
      "Accept-Encoding": "gzip, deflate, br",
    },
    timeout: 20000,
    decompress: true,
  });
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

router.get("/img", async (req, res) => {
  const { url } = req.query as Record<string, string>;
  if (!url) { res.status(400).send("Missing url"); return; }
  const cacheKey = `img:${url}`;
  const cached = getCache(cacheKey);
  if (cached) {
    const { contentType, data } = cached as { contentType: string; data: string };
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(data, "base64"));
    return;
  }
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://winbu.net/",
        "Accept": "image/*,*/*;q=0.8",
      },
      timeout: 12000,
    });
    const contentType = response.headers["content-type"] || "image/jpeg";
    const buf = Buffer.from(response.data);
    setCache(cacheKey, { contentType, data: buf.toString("base64") }, TTL.detail);
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buf);
  } catch {
    res.status(404).send("Image not found");
  }
});

router.get("/home", async (req, res) => {
  const cacheKey = "home";
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI("/home");
    const inner = raw?.data || {};
    const data = {
      top10_anime: normalizeList(inner.top10_anime),
      top10_film: normalizeList(inner.top10_film),
      latest_anime: normalizeList(inner.latest_anime),
      latest_film: normalizeList(inner.latest_film),
      latest_series: normalizeList(inner.latest_series),
      tv_show: normalizeList(inner.tv_show),
    };
    setCache(cacheKey, data, TTL.home);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch home");
    res.status(500).json({ ok: false, data: null });
  }
});

router.get("/search", async (req, res) => {
  const { q, page } = req.query as Record<string, string>;
  const cacheKey = `search:${q}:${page || 1}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json(cached); return; }
  try {
    const raw = await fetchAPI("/search", { q, page: page ? Number(page) : 1 });
    const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
    setCache(cacheKey, result, TTL.search);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to search");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/animedonghua", async (req, res) => {
  const { page } = req.query as Record<string, string>;
  const cacheKey = `animedonghua:${page || 1}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json(cached); return; }
  try {
    const raw = await fetchAPI("/animedonghua", { page: page ? Number(page) : 1 });
    const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
    setCache(cacheKey, result, TTL.list);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch animedonghua");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/film", async (req, res) => {
  const { page } = req.query as Record<string, string>;
  const cacheKey = `film:${page || 1}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json(cached); return; }
  try {
    const raw = await fetchAPI("/film", { page: page ? Number(page) : 1 });
    const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
    setCache(cacheKey, result, TTL.list);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch film");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/series", async (req, res) => {
  const { page } = req.query as Record<string, string>;
  const cacheKey = `series:${page || 1}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json(cached); return; }
  try {
    const raw = await fetchAPI("/series", { page: page ? Number(page) : 1 });
    const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
    setCache(cacheKey, result, TTL.list);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch series");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/tvshow", async (req, res) => {
  const { page } = req.query as Record<string, string>;
  const cacheKey = `tvshow:${page || 1}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json(cached); return; }
  try {
    const raw = await fetchAPI("/tvshow", { page: page ? Number(page) : 1 });
    const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
    setCache(cacheKey, result, TTL.list);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch tvshow");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/others", async (req, res) => {
  const { page } = req.query as Record<string, string>;
  const cacheKey = `others:${page || 1}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json(cached); return; }
  try {
    const raw = await fetchAPI("/others", { page: page ? Number(page) : 1 });
    const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
    setCache(cacheKey, result, TTL.list);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch others");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/genres", async (req, res) => {
  const cacheKey = "genres";
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI("/genres");
    const data = normalizeList(raw?.data);
    setCache(cacheKey, data, TTL.genres);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch genres");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/genre/:slug", async (req, res) => {
  const { slug } = req.params;
  const { page } = req.query as Record<string, string>;
  const cacheKey = `genre:${slug}:${page || 1}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json(cached); return; }
  try {
    const raw = await fetchAPI(`/genre/${slug}`, { page: page ? Number(page) : 1 });
    const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
    setCache(cacheKey, result, TTL.list);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch genre");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/schedule", async (req, res) => {
  const { day } = req.query as Record<string, string>;
  const cacheKey = `schedule:${day || "all"}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI("/schedule", { day });
    const data = raw?.data;
    const result = typeof data === "object" && !Array.isArray(data) ? data : normalizeList(data);
    setCache(cacheKey, result, TTL.list);
    res.json({ ok: true, data: result });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch schedule");
    res.status(500).json({ ok: false, data: {} });
  }
});

router.get("/update", async (req, res) => {
  const cacheKey = "update";
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI("/update");
    const data = normalizeList(raw?.data);
    setCache(cacheKey, data, TTL.list);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch update");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/latest", async (req, res) => {
  const cacheKey = "latest";
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI("/latest");
    const data = normalizeList(raw?.data);
    setCache(cacheKey, data, TTL.list);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch latest");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/ongoing", async (req, res) => {
  const cacheKey = "ongoing";
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI("/ongoing");
    const data = normalizeList(raw?.data);
    setCache(cacheKey, data, TTL.list);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch ongoing");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/completed", async (req, res) => {
  const cacheKey = "completed";
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI("/completed");
    const data = normalizeList(raw?.data);
    setCache(cacheKey, data, TTL.list);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch completed");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/populer", async (req, res) => {
  const cacheKey = "populer";
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI("/populer");
    const data = normalizeList(raw?.data);
    setCache(cacheKey, data, TTL.list);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch populer");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/all-anime", async (req, res) => {
  const { page } = req.query as Record<string, string>;
  const cacheKey = `all-anime:${page || 1}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json(cached); return; }
  try {
    const raw = await fetchAPI("/all-anime", { page: page ? Number(page) : 1 });
    const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
    setCache(cacheKey, result, TTL.list);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch all-anime");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/catalog", async (req, res) => {
  const { title, page, order, type, status } = req.query as Record<string, string>;
  const cacheKey = `catalog:${title}:${page || 1}:${order}:${type}:${status}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json(cached); return; }
  try {
    const raw = await fetchAPI("/catalog", { title, page: page ? Number(page) : 1, order, type, status });
    const result = { ok: true, data: normalizeList(raw?.data), total: raw?.total };
    setCache(cacheKey, result, TTL.list);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch catalog");
    res.status(500).json({ ok: false, data: [] });
  }
});

router.get("/anime/:slug", async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `anime:${slug}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI(`/anime/${slug}`);
    const d = raw?.data || {};
    const episodes = normalizeList(d.episodes).map((ep: unknown) => {
      const e = ep as Record<string, unknown>;
      return { ...e, slug: e.id || e.slug };
    });
    const recommendations = normalizeList(d.recommendations);
    const data = { ...d, episodes, recommendations };
    setCache(cacheKey, data, TTL.detail);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch anime detail");
    res.status(500).json({ ok: false, data: null });
  }
});

router.get("/episode/:slug", async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `episode:${slug}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI(`/episode/${slug}`);
    const d = raw?.data || {};
    setCache(cacheKey, d, TTL.episode);
    res.json({ ok: true, data: d });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch episode");
    res.status(500).json({ ok: false, data: null });
  }
});

router.get("/series/:slug", async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `series:detail:${slug}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI(`/series/${slug}`);
    const d = raw?.data || {};
    const episodes = normalizeList(d.episodes).map((ep: unknown) => {
      const e = ep as Record<string, unknown>;
      return { ...e, slug: e.id || e.slug };
    });
    const data = { ...d, episodes };
    setCache(cacheKey, data, TTL.detail);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch series detail");
    res.status(500).json({ ok: false, data: null });
  }
});

router.get("/film/:slug", async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `film:detail:${slug}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI(`/film/${slug}`);
    const data = raw?.data || null;
    if (data) setCache(cacheKey, data, TTL.detail);
    res.json({ ok: true, data });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch film detail");
    res.status(500).json({ ok: false, data: null });
  }
});

router.get("/server", async (req, res) => {
  const { post, nume, type } = req.query as Record<string, string>;
  const cacheKey = `server:${post}:${nume}:${type}`;
  const cached = getCache(cacheKey);
  if (cached) { res.json({ ok: true, data: cached }); return; }
  try {
    const raw = await fetchAPI("/server", { post, nume, type });
    setCache(cacheKey, raw, TTL.episode);
    res.json({ ok: true, data: raw });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch server");
    res.status(500).json({ ok: false, data: null });
  }
});

export default router;
