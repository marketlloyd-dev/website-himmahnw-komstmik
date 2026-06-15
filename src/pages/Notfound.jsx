import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-playfair font-bold text-green-400/30 mb-4">404</p>
      <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-white mb-3">
        Halaman tidak ditemukan
      </h1>
      <p className="text-green-300/70 mb-8 max-w-sm">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold transition-all"
        >
          <Home size={18} /> Ke Beranda
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-semibold transition-all"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
      </div>
    </div>
  );
}