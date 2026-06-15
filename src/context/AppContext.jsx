import { createContext, useContext, useState, useEffect } from 'react';

const defaultPengurus = {
  ketua:      { nama: 'Zurrahim',             foto: '/ketua.jpg' },
  sekretaris: { nama: 'Nur Assifauzohroh',    foto: '/sekretaris.jpg' },
  bendahara:  { nama: 'Nanda Aulia Prihatin', foto: '/bendahara.jpg' },
};

const defaultDivisi = [
  {
    id: 1, nama: 'Divisi Dakwah & Keagamaan',
    programKerja: ['Pengajian Rutin Mingguan', 'Peringatan Hari Besar Islam', 'Kajian Kitab Kuning', 'Pelatihan Tilawah & Tartil'],
    anggota: ['Muhammad Ali (Kadiv)', 'Hasan Basri', "Ahmad Syafi'i", 'Zainuddin'],
  },
  {
    id: 2, nama: 'Divisi Pendidikan & Pelatihan',
    programKerja: ['Seminar Teknologi', 'Workshop Programming', 'Pelatihan Desain Grafis', 'Study Club'],
    anggota: ['Baiq Dewi (Kadiv)', 'Lalu Rahman', 'Rizki Maulana', 'Fitriani'],
  },
  {
    id: 3, nama: 'Divisi Sosial & Kemasyarakatan',
    programKerja: ['Bakti Sosial', 'Santunan Anak Yatim', 'Bersih Lingkungan', 'Donor Darah'],
    anggota: ['Abdul Hamid (Kadiv)', 'Nurul Hidayah', 'Samsul Arifin', 'Rina Agustina'],
  },
  {
    id: 4, nama: 'Divisi Minat & Bakat',
    programKerja: ['Futsal Competition', 'Pentas Seni', 'Lomba Debat', 'Pelatihan Public Speaking'],
    anggota: ['Fajar Ramadhan (Kadiv)', 'Baiq Aulia', 'Dimas Saputra', 'Maya Sari'],
  },
];

const defaultBerita = [
  {
    id: 1, judul: 'HIMMAH NW STMIK Gelar Bakti Sosial di Desa Sembalun',
    tanggal: '2024-12-10', foto: '/sekretaris.jpg',
    kategori: 'Sosial',
    paragraf: [
      { judulParagraf: 'Pembukaan', isiParagraf: 'Kegiatan bakti sosial yang diadakan oleh HIMMAH NW Komisariat STMIK berlangsung sukses di Desa Sembalun. Puluhan mahasiswa turun langsung membantu masyarakat...' },
      { judulParagraf: 'Rangkaian Acara', isiParagraf: 'Acara dimulai dengan apel pagi, kemudian pembagian sembako, pengobatan gratis, dan diakhiri dengan ramah tamah bersama warga.' },
    ],
  },
  {
    id: 2, judul: 'Seminar Nasional Teknologi 4.0 Bersama Pakar IT',
    tanggal: '2024-11-25', foto: '/bendahara.jpg',
    kategori: 'Pendidikan',
    paragraf: [{ judulParagraf: 'Pembukaan', isiParagraf: 'Bertempat di Aula Kampus STMIK, seminar nasional ini menghadirkan pakar IT dari berbagai instansi...' }],
  },
  {
    id: 3, judul: 'Pelantikan Pengurus Baru HIMMAH NW Periode 2024-2025',
    tanggal: '2024-11-01', foto: '/ketua.jpg',
    kategori: 'Organisasi',
    paragraf: [{ judulParagraf: 'Prosesi Pelantikan', isiParagraf: 'Prosesi pelantikan pengurus baru berjalan khidmat, dihadiri oleh jajaran dewan pembina dan seluruh anggota...' }],
  },
];

const AppContext = createContext();

const DATA_BLOB_URL = 'https://trwurgahpjquoqvn.public.blob.vercel-storage.com/data.json';
const LOCAL_KEY = 'himmah_data';

export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [berita, setBerita]             = useState([]);
  const [divisi, setDivisi]             = useState(defaultDivisi);
  const [pengurus, setPengurus]         = useState(defaultPengurus);
  const [bannerImages, setBannerImages] = useState([]);
  const [logo, setLogo]                 = useState(null);
  const [komentar, setKomentar]         = useState({}); // { [beritaId]: [...] }
  const [dataLoaded, setDataLoaded]     = useState(false);
  const [sambutanKetua, setSambutanKetua] = useState(
    "Assalamu'alaikum warahmatullahi wabarakatuh. Puji syukur kehadirat Allah SWT yang telah memberikan kita nikmat iman dan Islam. HIMMAH NW Komisariat STMIK hadir sebagai wadah bagi mahasiswa untuk mengembangkan potensi diri dalam bidang keagamaan, akademik, dan sosial kemasyarakatan..."
  );

  const applyData = (data) => {
    setBerita(data.berita       || defaultBerita);
    setDivisi(data.divisi       || defaultDivisi);
    setPengurus(data.pengurus   || defaultPengurus);
    setBannerImages(data.bannerImages || []);
    setLogo(data.logo           || null);
    setKomentar(data.komentar   || {});
    if (data.sambutanKetua) setSambutanKetua(data.sambutanKetua);
  };

  // ─── Ambil data dari Blob, update localStorage jika berbeda ───
  const fetchBlobAndUpdate = async (currentLocal) => {
    try {
      const res = await fetch(`${DATA_BLOB_URL}?t=${Date.now()}`);
      if (!res.ok) return;
      const json = await res.json();
      // migrate: redaksi → paragraf
      if (json.berita) {
        json.berita = json.berita.map((b) =>
          !b.paragraf && b.redaksi
            ? { ...b, paragraf: [{ judulParagraf: '', isiParagraf: b.redaksi }] }
            : b
        );
      }
      if (JSON.stringify(json) !== JSON.stringify(currentLocal)) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(json));
        applyData(json);
      }
    } catch (_) {}
  };

  useEffect(() => {
    // Cek login session
    if (localStorage.getItem('himmah_login') === 'true') setIsLoggedIn(true);

    const load = async () => {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          applyData(parsed);
          setDataLoaded(true);
          fetchBlobAndUpdate(parsed); // background sync
          return;
        } catch (_) {}
      }
      // Tidak ada localStorage — ambil dari Blob
      try {
        const res = await fetch(`${DATA_BLOB_URL}?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.berita) {
            json.berita = json.berita.map((b) =>
              !b.paragraf && b.redaksi
                ? { ...b, paragraf: [{ judulParagraf: '', isiParagraf: b.redaksi }] }
                : b
            );
          }
          localStorage.setItem(LOCAL_KEY, JSON.stringify(json));
          applyData(json);
        }
      } catch (_) {}
      setDataLoaded(true);
    };
    load();
  }, []);

  // ─── Simpan ke Blob + localStorage ───────────────────────────
  const saveAllData = async (data) => {
    const toSave = { ...data };
    delete toSave.isLoggedIn;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(toSave));
    try {
      await fetch('/api/save-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      });
    } catch (err) {
      console.error('Gagal menyimpan ke Blob:', err);
    }
  };

  const buildPayload = (overrides) => ({
    berita, divisi, pengurus, bannerImages, logo, komentar, sambutanKetua,
    ...overrides,
  });

  const saveBerita       = (d) => { setBerita(d);        saveAllData(buildPayload({ berita: d })); };
  const saveDivisi       = (d) => { setDivisi(d);        saveAllData(buildPayload({ divisi: d })); };
  const savePengurus     = (d) => { setPengurus(d);      saveAllData(buildPayload({ pengurus: d })); };
  const saveBanner       = (d) => { setBannerImages(d);  saveAllData(buildPayload({ bannerImages: d })); };
  const saveLogo         = (u) => { setLogo(u);          saveAllData(buildPayload({ logo: u })); };
  const saveSambutan     = (t) => { setSambutanKetua(t); saveAllData(buildPayload({ sambutanKetua: t })); };

  // ─── Komentar disimpan ke Blob ────────────────────────────────
  const tambahKomentar = (beritaId, teks) => {
    const entry = { teks, timestamp: new Date().toISOString() };
    const updated = {
      ...komentar,
      [beritaId]: [...(komentar[beritaId] || []), entry],
    };
    setKomentar(updated);
    saveAllData(buildPayload({ komentar: updated }));
  };

  // ─── Login via API (password tidak ada di frontend) ──────────
  const login = async (username, password) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (json.success) {
        setIsLoggedIn(true);
        localStorage.setItem('himmah_login', 'true');
        return { success: true };
      }
      return { success: false, message: json.message };
    } catch (_) {
      return { success: false, message: 'Gagal menghubungi server' };
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('himmah_login');
  };

  if (!dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#004d24]">
        <p className="text-white text-lg">Memuat data...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        isLoggedIn, login, logout,
        berita, saveBerita,
        divisi, saveDivisi,
        pengurus, savePengurus,
        bannerImages, saveBanner,
        logo, saveLogo,
        komentar, tambahKomentar,
        sambutanKetua, saveSambutan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);