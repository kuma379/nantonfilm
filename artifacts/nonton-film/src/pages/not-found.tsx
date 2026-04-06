import { Link } from "wouter";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center text-center px-4">
      <AlertCircle className="h-16 w-16 text-primary mb-4 opacity-60" />
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-xl text-muted-foreground mb-6">Halaman tidak ditemukan</p>
      <Link href="/">
        <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-white font-semibold hover:bg-primary/90 transition-all">
          <Home className="h-4 w-4" /> Kembali ke Beranda
        </button>
      </Link>
    </div>
  );
}
