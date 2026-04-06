import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function proxyImg(url?: string): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("data:")) return url;
  return `/api/img?url=${encodeURIComponent(url)}`;
}
