import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Quote } from 'lucide-react';
import BannerSlider from '../components/BannerSlider';

export default function Beranda() {
  const { bannerImages, logo, pengurus, berita, sambutanKetua } = useApp();

  const beritaTerbaru = berita.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <div className="relative bg-gradient-to-br from-[#002b13] via-[#004d24] to-[#006b32] py-20 sm:py-32 overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <img
            src={logo || '/logo.png'}
            alt="Logo HIMMAH NW"
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 object-contain rounded-full shadow-2xl"
            onError={(e) => (e.target.style.display = 'none')}
          />
          <h1 className="text-4xl sm:text-6xl font-playfair font-bold text-white mb-4">
            HIMMAH NW
          </h1>
          <p className="text-xl sm:text-2xl text-green-200 font-light mb-6">
            Komisariat STMIK SZ NW Anjani
          </p>
          <p className="text-green-300/80 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Himpunan Mahasiswa Nahdlatul Wathan — Wadah pergerakan, pengabdian, dan prestasi mahasiswa.
          </p>
          <Link
            to="/informasi"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-all"
          >
            Kenali Kami <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-16">

        {/* Banner Slider */}
        {bannerImages.length > 0 && (
          <div className="mb-12">
            <BannerSlider customBanners={bannerImages} />
          </div>
        )}

        {/* Sambutan Ketua */}
        <div className="glass p-6 sm:p-8 rounded-2xl mb-12 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-green-400/50 flex-shrink-0">
            <img
              src={pengurus.ketua.foto}
              alt="Ketua"
              className="w-full h-full object-cover"
              onError={(e) =>
                (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pengurus.ketua.nama)}&background=004d24&color=fff&size=150`)
              }
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Quote size={20} className="text-green-400" />
              <h3 className="text-white font-semibold text-lg">Sambutan Ketua</h3>
            </div>
            <p className="text-green-100/80 leading-relaxed text-sm sm:text-base">
              "{sambutanKetua}"
            </p>
            <p className="text-green-300 font-medium mt-2">— {pengurus.ketua.nama}</p>
          </div>
        </div>

        {/* Pengurus Inti */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-white text-center mb-8">
            Pengurus Inti
          </h2>
          <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto snap-x sm:snap-none pb-4">
            {/* Sekretaris */}
            <div className="glass p-4 rounded-2xl text-center hover:scale-[1.02] transition-all shrink-0 w-40 sm:w-auto snap-center">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-green-400/50 mb-3">
                <img src={pengurus.sekretaris.foto} alt="Sekretaris" className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pengurus.sekretaris.nama)}&background=004d24&color=fff&size=150`)} />
              </div>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Sekretaris</span>
              <p className="text-white font-medium text-sm mt-1">{pengurus.sekretaris.nama}</p>
            </div>
            {/* Ketua */}
            <div className="glass p-6 rounded-2xl text-center hover:scale-[1.02] transition-all shrink-0 w-48 sm:w-auto snap-center sm:-mt-6">
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-yellow-400/50 mb-3 shadow-lg">
                <img src={pengurus.ketua.foto} alt="Ketua" className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pengurus.ketua.nama)}&background=004d24&color=fff&size=150`)} />
              </div>
              <span className="text-sm bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full font-semibold">Ketua Umum</span>
              <p className="text-white font-bold text-lg mt-2">{pengurus.ketua.nama}</p>
            </div>
            {/* Bendahara */}
            <div className="glass p-4 rounded-2xl text-center hover:scale-[1.02] transition-all shrink-0 w-40 sm:w-auto snap-center">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-green-400/50 mb-3">
                <img src={pengurus.bendahara.foto} alt="Bendahara" className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pengurus.bendahara.nama)}&background=004d24&color=fff&size=150`)} />
              </div>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">Bendahara</span>
              <p className="text-white font-medium text-sm mt-1">{pengurus.bendahara.nama}</p>
            </div>
          </div>
        </div>

        {/* Berita Terbaru */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-white">Berita Terbaru</h2>
            <Link to="/berita" className="text-green-300 hover:text-green-200 flex items-center gap-1 text-sm">
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {beritaTerbaru.map((item) => (
              <Link
                key={item.id}
                to={`/berita/${item.id}`}
                className="glass rounded-xl overflow-hidden hover:scale-[1.02] transition-all group"
              >
                <div className="h-40 overflow-hidden">
                  <img src={item.foto} alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.target.src = 'https://placehold.co/400x200/004d24/ffffff?text=HIMMAH+NW')} />
                </div>
                <div className="p-3">
                  <span className="text-xs text-green-300/70 flex items-center gap-1 mb-1">
                    <Calendar size={12} /> {item.tanggal}
                  </span>
                  <h3 className="text-white font-semibold text-sm line-clamp-2">{item.judul}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}