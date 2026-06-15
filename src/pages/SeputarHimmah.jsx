import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, Send, ArrowLeft, Clock, Tag, User, MessageCircle, Search, Filter } from 'lucide-react';

// ─── Detail Berita ────────────────────────────────────────────
function DetailBerita({ berita, komentar, tambahKomentar }) {
  const navigate = useNavigate();
  const [teks, setTeks] = useState('');

  const handleKirim = () => {
    if (!teks.trim()) return;
    tambahKomentar(berita.id, teks.trim());
    setTeks('');
  };

  const komentarBerita = komentar[berita.id] || [];

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-br from-[#003d1c] to-[#004d24] py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate('/berita')}
            className="flex items-center gap-2 text-green-300 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke daftar berita</span>
          </button>
          <h1 className="text-2xl sm:text-4xl font-playfair font-bold text-white leading-tight">
            {berita.judul}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-green-300/70 mt-4">
            <span className="flex items-center gap-1"><Calendar size={16} /> {berita.tanggal}</span>
            {berita.kategori && (
              <span className="flex items-center gap-1"><Tag size={16} /> {berita.kategori}</span>
            )}
            <span className="flex items-center gap-1"><User size={16} /> Admin HIMMAH</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-12">
        {berita.foto && (
          <div className="glass rounded-2xl overflow-hidden mb-8">
            <img
              src={berita.foto}
              alt={berita.judul}
              className="w-full max-h-96 object-cover"
              onError={(e) => { e.target.src = 'https://placehold.co/800x400/004d24/ffffff?text=HIMMAH+NW'; }}
            />
          </div>
        )}

        <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
          {berita.paragraf?.map((p, i) => (
            <div key={i} className="mb-5">
              {p.judulParagraf && (
                <h3 className="text-white font-semibold text-lg mb-2">{p.judulParagraf}</h3>
              )}
              <p className="text-green-100/80 leading-relaxed">{p.isiParagraf}</p>
            </div>
          ))}
          {!berita.paragraf && (
            <div
              className="prose prose-invert max-w-none text-green-100/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: berita.kontenHTML || berita.redaksi || '' }}
            />
          )}
        </div>

        {/* Komentar — tersimpan global di Blob */}
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-green-400" />
            <h3 className="text-white font-bold text-lg">Komentar</h3>
            <span className="text-green-400/50 text-sm">({komentarBerita.length})</span>
          </div>

          {komentarBerita.length === 0 && (
            <p className="text-green-300/50 text-sm">Belum ada komentar. Jadilah yang pertama!</p>
          )}

          {komentarBerita.map((k, i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <User size={14} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Pengunjung</p>
                  <p className="text-green-400/50 text-xs flex items-center gap-1">
                    <Clock size={10} /> {new Date(k.timestamp).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <p className="text-green-100/80 text-sm mt-2">{k.teks}</p>
            </div>
          ))}

          <div className="flex gap-2 mt-4">
            <textarea
              value={teks}
              onChange={(e) => setTeks(e.target.value)}
              placeholder="Tulis komentar..."
              rows={3}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm resize-none focus:outline-none focus:border-green-400"
            />
            <button
              onClick={handleKirim}
              className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center gap-2 self-end transition-colors"
            >
              <Send size={16} /> Kirim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Daftar Berita ────────────────────────────────────────────
export default function SeputarHimmah() {
  const { berita, komentar, tambahKomentar } = useApp();
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('');

  // Jika ada :id di URL, tampilkan detail
  if (id) {
    const item = berita.find((b) => String(b.id) === id);
    if (!item) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
          <p className="text-2xl font-bold">Berita tidak ditemukan</p>
          <Link to="/berita" className="text-green-300 hover:underline">← Kembali ke daftar berita</Link>
        </div>
      );
    }
    return <DetailBerita berita={item} komentar={komentar} tambahKomentar={tambahKomentar} />;
  }

  // Daftar semua kategori unik
  const kategoriList = [...new Set(berita.map((b) => b.kategori).filter(Boolean))];

  const filtered = berita.filter((b) => {
    const matchSearch = b.judul.toLowerCase().includes(search.toLowerCase());
    const matchKategori = filterKategori ? b.kategori === filterKategori : true;
    return matchSearch && matchKategori;
  });

  return (
    <div className="min-h-screen pb-16">
      <div className="bg-gradient-to-br from-[#003d1c] to-[#004d24] py-12 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-white">Seputar HIMMAH NW</h1>
        <p className="text-green-300 mt-2">Berita & Kegiatan Terkini Komisariat</p>
      </div>

      {/* Search & Filter */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-6">
        <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berita..."
              className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-green-400"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400/60" />
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-green-400 appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#004d24]">Semua Kategori</option>
              {kategoriList.map((k) => (
                <option key={k} value={k} className="bg-[#004d24]">{k}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="glass p-12 text-center rounded-2xl">
            <p className="text-green-300/60">Tidak ada berita yang ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((item) => (
              <Link
                key={item.id}
                to={`/berita/${item.id}`}
                className="glass rounded-2xl overflow-hidden hover:scale-[1.01] transition-all group"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.foto}
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://placehold.co/600x300/004d24/ffffff?text=HIMMAH+NW'; }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 text-xs text-green-300/70 mb-2">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {item.tanggal}</span>
                    {item.kategori && (
                      <span className="bg-green-500/15 px-2 py-0.5 rounded-full text-green-300">{item.kategori}</span>
                    )}
                  </div>
                  <h2 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-green-300 transition-colors">
                    {item.judul}
                  </h2>
                  <div className="mt-3 text-green-400/60 text-xs flex items-center justify-between">
                    <span>Baca selengkapnya →</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} /> {(komentar[item.id] || []).length}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}