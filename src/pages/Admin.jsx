import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { adminAccounts } from '../data/config';
import Cropper from 'react-easy-crop';
import {
  LogOut, Plus, Trash2, Edit3, Save, X, Check, Crop as CropIcon,
  Newspaper, Users, Image, Palette, User, TrendingUp, Calendar,
  Tag, Bold, Italic, Underline, Strikethrough, Link, Quote,
  Heading1, Heading2, List, ListOrdered, ImagePlus
} from 'lucide-react';

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

// ---------- helper upload ImgBB ----------
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file) {
  if (!IMGBB_API_KEY) throw new Error('API Key ImgBB tidak ditemukan');
  const base64 = await fileToBase64(file);
  const formData = new FormData();
  formData.append('key', IMGBB_API_KEY);
  formData.append('image', base64);
  formData.append('name', file.name);
  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error?.message || 'Upload gagal');
  return result.data.url;
}

// ---------- Rich Text Editor (contentEditable + sinkron value) ----------
function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const imageInputRef = useRef(null);
  const isInternalChange = useRef(false);

  // Sinkronkan value dari luar → editor (misal saat edit berita)
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const execCommand = (command, val = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      execCommand('createLink', linkUrl.trim());
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      execCommand('insertImage', url);
    } catch (err) {
      alert('Gagal upload gambar: ' + err.message);
    }
  };

  return (
    <div className="border border-white/20 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b">
        <button type="button" onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded" title="Tebal"><Bold size={16} /></button>
        <button type="button" onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded" title="Miring"><Italic size={16} /></button>
        <button type="button" onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded" title="Garis Bawah"><Underline size={16} /></button>
        <button type="button" onClick={() => execCommand('strikeThrough')} className="p-2 hover:bg-gray-200 rounded" title="Coret"><Strikethrough size={16} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button type="button" onClick={() => execCommand('formatBlock', '<h2>')} className="p-2 hover:bg-gray-200 rounded" title="Heading 1"><Heading1 size={16} /></button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h3>')} className="p-2 hover:bg-gray-200 rounded" title="Heading 2"><Heading2 size={16} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded" title="List"><List size={16} /></button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded" title="List Bernomor"><ListOrdered size={16} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button type="button" onClick={() => execCommand('formatBlock', '<blockquote>')} className="p-2 hover:bg-gray-200 rounded" title="Quote"><Quote size={16} /></button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button type="button" onClick={() => setShowLinkInput(!showLinkInput)} className="p-2 hover:bg-gray-200 rounded" title="Tautan"><Link size={16} /></button>
        <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-gray-200 rounded" title="Gambar"><ImagePlus size={16} /></button>
        <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />

        {showLinkInput && (
          <div className="flex items-center gap-1 ml-2">
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="px-2 py-1 text-sm border rounded w-40"
            />
            <button type="button" onClick={handleInsertLink} className="px-2 py-1 bg-green-500 text-white text-xs rounded">OK</button>
          </div>
        )}
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir="ltr"
        className="min-h-[300px] p-4 text-gray-800 focus:outline-none"
        style={{ direction: 'ltr', textAlign: 'left' }}
        onInput={() => {
          if (editorRef.current) {
            isInternalChange.current = true;
            onChange(editorRef.current.innerHTML);
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
        data-placeholder={placeholder || 'Tulis konten berita...'}
      />
    </div>
  );
}

// ---------- helper crop ----------
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise(async (resolve, reject) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas is empty'));
      blob.name = 'cropped.jpg';
      resolve(blob);
    }, 'image/jpeg');
  });
}

// ---------- KOMPONEN ADMIN ----------
export default function Admin() {
  const { isLoggedIn, login, logout, berita, saveBerita, divisi, saveDivisi, bannerImages, saveBanner, logo, saveLogo, pengurus, savePengurus, sambutanKetua, saveSambutan } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [editSambutan, setEditSambutan] = useState(false);
  const [draftSambutan, setDraftSambutan] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUploading, setIsUploading] = useState(false);

  // berita
  const [beritaForm, setBeritaForm] = useState({ judul: '', tanggal: '', kategori: '', fotoFile: null, kontenHTML: '' });
  const [editBeritaId, setEditBeritaId] = useState(null);
  const fileBeritaRef = useRef(null);

  // divisi
  const [divisiForm, setDivisiForm] = useState({ nama: '', programKerja: '', anggota: '' });
  const [editDivisiId, setEditDivisiId] = useState(null);

  // banner
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerAlt, setBannerAlt] = useState('');

  // logo
  const [previewLogo, setPreviewLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  // pengurus
  const [pengurusForm, setPengurusForm] = useState({ ketua: { nama: '', fotoFile: null }, sekretaris: { nama: '', fotoFile: null }, bendahara: { nama: '', fotoFile: null } });
  const [previewPengurus, setPreviewPengurus] = useState({ ketua: null, sekretaris: null, bendahara: null });

  // crop
  const [cropOpen, setCropOpen] = useState(false);
  const [cropRole, setCropRole] = useState(null);
  const [cropSrc, setCropSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const onCropComplete = useCallback((_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels), []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('Memeriksa...');
    const result = await login(username, password);
    if (result.success) {
      setLoginError('');
    } else {
      setLoginError(result.message || 'Username atau password salah!');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#002b13] to-[#004d24]">
        <div className="glass p-8 rounded-2xl w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3"><User size={32} className="text-green-400" /></div>
            <h2 className="text-2xl font-playfair font-bold text-white">Panel Admin</h2>
            <p className="text-green-300/60 text-sm mt-1">HIMMAH NW Komisariat STMIK</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="text-green-300 text-sm font-medium">Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mt-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400" placeholder="Masukkan username" required /></div>
            <div><label className="text-green-300 text-sm font-medium">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400" placeholder="Masukkan password" required /></div>
            {loginError && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{loginError}</p>}
            <button type="submit" className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors">Masuk ke Panel</button>
          </form>
        </div>
      </div>
    );
  }

  // ===================== BERITA CRUD =====================
  const handleBeritaSubmit = async (e) => {
    e.preventDefault();
    if (!beritaForm.judul || !beritaForm.kontenHTML) return;
    let fotoUrl = '';
    if (beritaForm.fotoFile) {
      setIsUploading(true);
      try { fotoUrl = await uploadImage(beritaForm.fotoFile); } catch (err) { alert('Gagal upload foto: ' + err.message); setIsUploading(false); return; }
      setIsUploading(false);
    } else if (editBeritaId) {
      fotoUrl = berita.find(b => b.id === editBeritaId)?.foto || '';
    }
    const newBerita = { id: editBeritaId || Date.now(), judul: beritaForm.judul, tanggal: beritaForm.tanggal || new Date().toISOString().slice(0, 10), kategori: beritaForm.kategori, foto: fotoUrl, kontenHTML: beritaForm.kontenHTML };
    if (editBeritaId) { saveBerita(berita.map(b => b.id === editBeritaId ? newBerita : b)); setEditBeritaId(null); }
    else saveBerita([newBerita, ...berita]);
    setBeritaForm({ judul: '', tanggal: '', kategori: '', fotoFile: null, kontenHTML: '' });
    if (fileBeritaRef.current) fileBeritaRef.current.value = '';
  };

  const handleEditBerita = (item) => {
    setBeritaForm({
      judul: item.judul || '',
      tanggal: item.tanggal || '',
      kategori: item.kategori || '',
      fotoFile: null,
      kontenHTML: item.kontenHTML || ''
    });
    setEditBeritaId(item.id);
    setActiveTab('berita');
  };

  const handleDeleteBerita = (id) => {
    if (window.confirm('Yakin ingin menghapus berita ini?')) saveBerita(berita.filter(b => b.id !== id));
  };

  // ===================== DIVISI CRUD =====================
  const handleDivisiSubmit = (e) => {
    e.preventDefault();
    const newDivisi = { id: editDivisiId || Date.now(), nama: divisiForm.nama, programKerja: divisiForm.programKerja.split('\n').filter(Boolean), anggota: divisiForm.anggota.split('\n').filter(Boolean) };
    if (editDivisiId) { saveDivisi(divisi.map(d => d.id === editDivisiId ? newDivisi : d)); setEditDivisiId(null); }
    else saveDivisi([...divisi, newDivisi]);
    setDivisiForm({ nama: '', programKerja: '', anggota: '' });
  };

  const handleEditDivisi = (item) => { setDivisiForm({ nama: item.nama, programKerja: item.programKerja.join('\n'), anggota: item.anggota.join('\n') }); setEditDivisiId(item.id); setActiveTab('divisi'); };
  const handleDeleteDivisi = (id) => { if (window.confirm('Yakin ingin menghapus divisi ini?')) saveDivisi(divisi.filter(d => d.id !== id)); };

  // ===================== BANNER CRUD =====================
  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerFile) return;
    setIsUploading(true);
    try { const imageUrl = await uploadImage(bannerFile); saveBanner([...bannerImages, { id: Date.now(), src: imageUrl, alt: bannerAlt }]); setBannerFile(null); setBannerAlt(''); } catch (err) { alert('Upload banner gagal: ' + err.message); }
    setIsUploading(false);
  };
  const handleDeleteBanner = (id) => saveBanner(bannerImages.filter(b => b.id !== id));

  // ===================== LOGO =====================
  const handleLogoChange = (e) => { const file = e.target.files[0]; if (file) { setLogoFile(file); const reader = new FileReader(); reader.onloadend = () => setPreviewLogo(reader.result); reader.readAsDataURL(file); } };
  const handleSaveLogo = async () => { if (!logoFile) return; setIsUploading(true); try { const imageUrl = await uploadImage(logoFile); saveLogo(imageUrl); setLogoFile(null); setPreviewLogo(null); alert('Logo berhasil diperbarui!'); } catch (err) { alert('Upload logo gagal: ' + err.message); } setIsUploading(false); };
  const handleResetLogo = () => { if (window.confirm('Reset logo ke default?')) { saveLogo(null); setPreviewLogo(null); setLogoFile(null); } };

  // ===================== PENGURUS =====================
  const loadPengurusToForm = () => {
    if (pengurus) setPengurusForm({ ketua: { nama: pengurus.ketua?.nama || '', fotoFile: null }, sekretaris: { nama: pengurus.sekretaris?.nama || '', fotoFile: null }, bendahara: { nama: pengurus.bendahara?.nama || '', fotoFile: null } });
  };
  const handleSaveInfoPengurus = (role) => {
    const newName = pengurusForm[role].nama;
    const newPengurus = { ...pengurus };
    newPengurus[role] = { ...newPengurus[role], nama: newName };
    savePengurus(newPengurus);
    alert(`Nama ${role} berhasil diperbarui!`);
  };
  const handleUploadFotoPengurus = async (role) => {
    const file = pengurusForm[role].fotoFile;
    if (!file) return;
    setIsUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      const newPengurus = { ...pengurus };
      newPengurus[role] = { ...newPengurus[role], foto: imageUrl };
      savePengurus(newPengurus);
      setPreviewPengurus({ ...previewPengurus, [role]: null });
      setPengurusForm({ ...pengurusForm, [role]: { ...pengurusForm[role], fotoFile: null } });
      alert(`Foto ${role} berhasil diperbarui!`);
    } catch (err) { alert('Upload foto gagal: ' + err.message); }
    setIsUploading(false);
  };

  const openCropModal = (role, file) => {
    const reader = new FileReader();
    reader.onload = () => { setCropSrc(reader.result); setCropRole(role); setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null); setCropOpen(true); };
    reader.readAsDataURL(file);
  };
  const handleCropSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(cropSrc, croppedAreaPixels);
      const file = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });
      setPengurusForm({ ...pengurusForm, [cropRole]: { ...pengurusForm[cropRole], fotoFile: file } });
      const reader = new FileReader();
      reader.onload = () => setPreviewPengurus({ ...previewPengurus, [cropRole]: reader.result });
      reader.readAsDataURL(file);
      setCropOpen(false);
    } catch (err) { alert('Gagal memotong gambar: ' + err.message); }
  };

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <TrendingUp size={16} /> },
    { key: 'berita', label: 'Berita', icon: <Newspaper size={16} /> },
    { key: 'divisi', label: 'Divisi', icon: <Users size={16} /> },
    { key: 'banner', label: 'Banner', icon: <Image size={16} /> },
    { key: 'logo', label: 'Logo', icon: <Palette size={16} /> },
    { key: 'pengurus', label: 'Pengurus', icon: <User size={16} /> },
  ];
  const handleTabChange = (tab) => { setActiveTab(tab); if (tab === 'pengurus') loadPengurusToForm(); };

  const totalBerita = berita.length;
  const totalDivisi = divisi.length;
  const totalBanner = bannerImages.length;
  const beritaTerbaru = berita.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      {/* Crop Modal */}
      {cropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="text-white font-semibold text-lg">Sesuaikan Foto</h3><button onClick={() => setCropOpen(false)} className="text-white/60 hover:text-white"><X size={20} /></button></div>
            <div className="relative w-full h-64 bg-gray-800 rounded-xl overflow-hidden"><Cropper image={cropSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} /></div>
            <div className="flex items-center gap-3"><label className="text-white text-sm">Zoom:</label><input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-green-500" /></div>
            <div className="flex justify-end gap-3"><button onClick={() => setCropOpen(false)} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">Batal</button><button onClick={handleCropSave} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"><CropIcon size={16} /> Potong & Simpan</button></div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* sidebar desktop */}
        <aside className="w-64 bg-[#0d1a0d] border-r border-green-900/30 flex-shrink-0 hidden lg:flex flex-col">
          <div className="p-6 border-b border-green-900/30"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center"><span className="text-green-400 font-bold text-sm">HN</span></div><div><p className="text-white font-bold text-sm">HIMMAH NW</p><p className="text-green-400/60 text-xs">Panel Admin</p></div></div></div>
          <nav className="flex-1 p-4 space-y-1">{tabs.map(tab => (<button key={tab.key} onClick={() => handleTabChange(tab.key)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>{tab.icon}{tab.label}</button>))}</nav>
          <div className="p-4 border-t border-green-900/30"><button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"><LogOut size={16} /> Logout</button></div>
        </aside>

        <div className="flex-1 flex flex-col">
          {/* header mobile */}
          <header className="bg-[#0d1a0d] border-b border-green-900/30 px-4 sm:px-6 py-4 flex items-center justify-between lg:hidden">
            <h1 className="text-white font-bold">Panel Admin</h1>
            <div className="flex items-center gap-2"><div className="flex lg:hidden flex-wrap gap-1">{tabs.slice(0,4).map(tab => (<button key={tab.key} onClick={() => handleTabChange(tab.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab===tab.key?'bg-green-500/20 text-green-400':'text-gray-400 hover:bg-white/5'}`}>{tab.label}</button>))}</div><button onClick={logout} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10">Logout</button></div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* ========== DASHBOARD ========== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-playfair font-bold text-white">Dashboard</h2><p className="text-gray-400 text-sm mt-1">Selamat datang di panel admin HIMMAH NW Komisariat STMIK</p></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-5"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">Total Berita</p><p className="text-white text-3xl font-bold mt-1">{totalBerita}</p></div><div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center"><Newspaper size={24} className="text-blue-400" /></div></div></div>
                  <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-5"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">Total Divisi</p><p className="text-white text-3xl font-bold mt-1">{totalDivisi}</p></div><div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center"><Users size={24} className="text-purple-400" /></div></div></div>
                  <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-5"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">Total Banner</p><p className="text-white text-3xl font-bold mt-1">{totalBanner}</p></div><div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center"><Image size={24} className="text-orange-400" /></div></div></div>
                  <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-5"><div className="flex items-center justify-between"><div><p className="text-gray-400 text-sm">Logo Aktif</p><p className="text-white text-3xl font-bold mt-1">{logo ? '1' : '0'}</p></div><div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center"><Palette size={24} className="text-green-400" /></div></div></div>
                </div>
                <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h3 className="text-white font-bold text-lg">Berita Terbaru</h3><button onClick={() => handleTabChange('berita')} className="text-green-400 text-sm hover:underline">Lihat Semua</button></div>
                  <div className="space-y-3">
                    {beritaTerbaru.length === 0 && <p className="text-gray-400 text-sm">Belum ada berita.</p>}
                    {beritaTerbaru.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                        <span className="text-2xl font-bold text-green-400/40 w-8">{index + 1}</span>
                        {item.foto && <img src={item.foto} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                        <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium line-clamp-1">{item.judul}</p><div className="flex items-center gap-3 text-xs text-gray-400 mt-1"><span className="flex items-center gap-1"><Calendar size={12} /> {item.tanggal}</span>{item.kategori && <span className="flex items-center gap-1"><Tag size={12} /> {item.kategori}</span>}</div></div>
                        <button onClick={() => handleEditBerita(item)} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit3 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========== BERITA ========== */}
            {activeTab === 'berita' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div><h2 className="text-2xl font-playfair font-bold text-white">Manajemen Berita</h2><p className="text-gray-400 text-sm mt-1">Kelola semua berita dan publikasi</p></div>
                  <button onClick={() => { setEditBeritaId(null); setBeritaForm({ judul: '', tanggal: '', kategori: '', fotoFile: null, kontenHTML: '' }); setActiveTab('berita'); }} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center gap-2 text-sm font-medium"><Plus size={16} /> Tulis Berita</button>
                </div>
                <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">{editBeritaId ? '✏️ Edit Berita' : '📝 Tulis Berita Baru'}</h3>
                  <form onSubmit={handleBeritaSubmit} className="space-y-4">
                    <input type="text" placeholder="Judul Berita" value={beritaForm.judul} onChange={(e) => setBeritaForm({ ...beritaForm, judul: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400 text-lg font-semibold" required />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div><label className="text-gray-400 text-xs mb-1 block">Tanggal</label><input type="date" value={beritaForm.tanggal} onChange={(e) => setBeritaForm({ ...beritaForm, tanggal: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-green-400" /></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">Kategori</label><input type="text" placeholder="Contoh: Sosial" value={beritaForm.kategori} onChange={(e) => setBeritaForm({ ...beritaForm, kategori: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400" /></div>
                      <div><label className="text-gray-400 text-xs mb-1 block">Foto Sampul</label><input type="file" accept="image/*" ref={fileBeritaRef} onChange={(e) => setBeritaForm({ ...beritaForm, fotoFile: e.target.files[0] })} className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-green-500 file:text-white" /></div>
                    </div>
                    <div><label className="text-gray-400 text-xs mb-1 block">Konten Berita</label>
                      <RichTextEditor
                        value={beritaForm.kontenHTML}
                        onChange={(value) => setBeritaForm({ ...beritaForm, kontenHTML: value })}
                        placeholder="Tulis konten berita di sini..."
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={isUploading} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50">{isUploading ? 'Mengunggah...' : <><Save size={16} /> {editBeritaId ? 'Update' : 'Publikasikan'}</>}</button>
                      {editBeritaId && <button type="button" onClick={() => { setEditBeritaId(null); setBeritaForm({ judul: '', tanggal: '', kategori: '', fotoFile: null, kontenHTML: '' }); }} className="px-6 py-3 bg-gray-500/30 text-white rounded-xl hover:bg-gray-500/50 transition-colors flex items-center gap-2"><X size={16} /> Batal</button>}
                    </div>
                  </form>
                </div>
                <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">📋 Semua Berita ({berita.length})</h3>
                  {berita.length === 0 ? <p className="text-gray-400 text-sm">Belum ada berita.</p> : (
                    <div className="space-y-3">
                      {berita.map((item, index) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4"><span className="text-2xl font-bold text-green-400/40 w-8 flex-shrink-0">{index + 1}</span>{item.foto && <img src={item.foto} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />}<div><p className="text-white font-medium line-clamp-1">{item.judul}</p><div className="flex items-center gap-3 text-xs text-gray-400 mt-1"><span className="flex items-center gap-1"><Calendar size={12} /> {item.tanggal}</span>{item.kategori && <span className="flex items-center gap-1"><Tag size={12} /> {item.kategori}</span>}</div></div></div>
                          <div className="flex gap-2 self-end sm:self-auto"><button onClick={() => handleEditBerita(item)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"><Edit3 size={14} /></button><button onClick={() => handleDeleteBerita(item.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><Trash2 size={14} /></button></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========== DIVISI ========== */}
            {activeTab === 'divisi' && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-playfair font-bold text-white">Manajemen Divisi</h2><p className="text-gray-400 text-sm mt-1">Kelola divisi dan program kerja</p></div>
                <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">{editDivisiId ? '✏️ Edit Divisi' : '➕ Tambah Divisi Baru'}</h3>
                  <form onSubmit={handleDivisiSubmit} className="space-y-4">
                    <input type="text" placeholder="Nama Divisi" value={divisiForm.nama} onChange={(e) => setDivisiForm({ ...divisiForm, nama: e.target.value })} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400" required />
                    <textarea placeholder="Program Kerja (satu per baris)" value={divisiForm.programKerja} onChange={(e) => setDivisiForm({ ...divisiForm, programKerja: e.target.value })} rows="3" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400 resize-none" required />
                    <textarea placeholder="Anggota (satu per baris, Kadiv di paling atas)" value={divisiForm.anggota} onChange={(e) => setDivisiForm({ ...divisiForm, anggota: e.target.value })} rows="3" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400 resize-none" required />
                    <div className="flex gap-3"><button type="submit" className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"><Save size={16} /> {editDivisiId ? 'Update' : 'Simpan'}</button>{editDivisiId && <button type="button" onClick={() => { setEditDivisiId(null); setDivisiForm({ nama: '', programKerja: '', anggota: '' }); }} className="px-6 py-3 bg-gray-500/30 text-white rounded-xl hover:bg-gray-500/50 transition-colors flex items-center gap-2"><X size={16} /> Batal</button>}</div>
                  </form>
                </div>
                <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">📋 Daftar Divisi ({divisi.length})</h3>
                  {divisi.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 rounded-xl mb-2">
                      <div><p className="text-white font-medium">{item.nama}</p><p className="text-gray-400 text-xs">{item.anggota.length} anggota · {item.programKerja.length} proker</p></div>
                      <div className="flex gap-2 self-end sm:self-auto"><button onClick={() => handleEditDivisi(item)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"><Edit3 size={14} /></button><button onClick={() => handleDeleteDivisi(item.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><Trash2 size={14} /></button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========== BANNER ========== */}
            {activeTab === 'banner' && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-playfair font-bold text-white">Manajemen Banner</h2><p className="text-gray-400 text-sm mt-1">Kelola banner slider di beranda</p></div>
                <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">➕ Tambah Banner</h3>
                  <form onSubmit={handleBannerSubmit} className="space-y-4">
                    <div><label className="text-gray-400 text-xs mb-1 block">File Gambar</label><input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-green-500 file:text-white" required /></div>
                    <input type="text" placeholder="Deskripsi Banner" value={bannerAlt} onChange={(e) => setBannerAlt(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-400" required />
                    <button type="submit" disabled={isUploading} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50">{isUploading ? 'Mengunggah...' : <><Plus size={16} /> Tambah Banner</>}</button>
                  </form>
                </div>
                <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">🖼️ Banner Aktif ({bannerImages.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bannerImages.map((banner) => (
                      <div key={banner.id} className="relative bg-white/5 rounded-xl overflow-hidden group">
                        <img src={banner.src} alt={banner.alt} className="w-full h-40 object-cover" onError={(e) => (e.target.src = 'https://placehold.co/400x200/333/fff?text=Error')} />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => handleDeleteBanner(banner.id)} className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600"><Trash2 size={18} /></button>
                        </div>
                        <p className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">{banner.alt}</p>
                      </div>
                    ))}
                    {bannerImages.length === 0 && <p className="text-gray-400 col-span-2 text-center py-8">Belum ada banner custom.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ========== LOGO ========== */}
            {activeTab === 'logo' && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-playfair font-bold text-white">Pengaturan Logo</h2><p className="text-gray-400 text-sm mt-1">Atur logo yang muncul di navbar dan header</p></div>
                <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="text-center"><p className="text-gray-400 text-sm mb-2">Logo Saat Ini</p><img src={logo || '/img/logo.png'} alt="Logo" className="w-24 h-24 object-contain rounded-full border-2 border-green-400/30 bg-white/5" onError={(e) => (e.target.src = '/img/logo.png')} /></div>
                    <div className="flex-1">
                      <label className="block text-gray-400 text-sm mb-2">Upload Logo Baru (PNG/JPG)</label>
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-green-500 file:text-white" />
                      {previewLogo && (
                        <div className="mt-3 flex items-center gap-4">
                          <img src={previewLogo} alt="Preview" className="w-16 h-16 object-contain rounded-lg border border-green-400/30" />
                          <div className="flex gap-2"><button onClick={handleSaveLogo} disabled={isUploading} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center gap-2 text-sm disabled:opacity-50">{isUploading ? 'Menyimpan...' : <><Check size={16} /> Simpan Logo</>}</button><button onClick={() => { setPreviewLogo(null); setLogoFile(null); }} className="px-4 py-2 bg-gray-500/30 text-white rounded-xl hover:bg-gray-500/50 text-sm">Batal</button></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-green-900/30 pt-4"><button onClick={handleResetLogo} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 flex items-center gap-2 text-sm"><Trash2 size={16} /> Reset ke Logo Default</button></div>
                </div>
              </div>
            )}

            {/* ========== SAMBUTAN KETUA ========== */}
            {activeTab === 'pengurus' && (
              <div className="space-y-4 mb-8 bg-[#111a11] border border-green-900/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">Sambutan Ketua</h3>
                  {!editSambutan ? (
                    <button onClick={() => { setDraftSambutan(sambutanKetua); setEditSambutan(true); }}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { saveSambutan(draftSambutan); setEditSambutan(false); }}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm">
                        Simpan
                      </button>
                      <button onClick={() => setEditSambutan(false)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm">
                        Batal
                      </button>
                    </div>
                  )}
                </div>
                {editSambutan ? (
                  <textarea
                    value={draftSambutan}
                    onChange={(e) => setDraftSambutan(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm resize-none focus:outline-none focus:border-green-400"
                  />
                ) : (
                  <p className="text-green-100/70 text-sm leading-relaxed">"{sambutanKetua}"</p>
                )}
              </div>
            )}

            {/* ========== PENGURUS ========== */}
            {activeTab === 'pengurus' && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-playfair font-bold text-white">Edit Pengurus Inti</h2><p className="text-gray-400 text-sm mt-1">Ubah nama dan foto Ketua, Sekretaris, Bendahara</p></div>
                <div className="bg-[#111a11] border border-green-900/30 rounded-2xl p-6 space-y-8">
                  {['ketua', 'sekretaris', 'bendahara'].map((role) => (
                    <div key={role} className="border border-green-900/20 rounded-xl p-5 space-y-4">
                      <h3 className="text-white font-semibold capitalize text-lg">{role} - {pengurus?.[role]?.nama || 'Belum ada data'}</h3>
                      <div className="flex items-start gap-4">
                        <img src={previewPengurus[role] || pengurus?.[role]?.foto || '/img/logo.png'} alt={role} className="w-20 h-20 rounded-full object-cover border-2 border-green-400/30" onError={(e) => { e.target.src = '/img/logo.png'; }} />
                        <div className="flex-1">
                          <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files[0]; if (file) openCropModal(role, file); }} className="block text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-green-500 file:text-white" />
                          {pengurusForm[role].fotoFile && <button onClick={() => handleUploadFotoPengurus(role)} disabled={isUploading} className="mt-2 px-3 py-1 bg-green-500 text-white rounded-lg text-sm">{isUploading ? 'Mengunggah...' : 'Simpan Foto'}</button>}
                        </div>
                      </div>
                      <div><label className="text-gray-400 text-xs">Nama</label><input type="text" value={pengurusForm[role].nama} onChange={(e) => setPengurusForm({ ...pengurusForm, [role]: { ...pengurusForm[role], nama: e.target.value } })} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm" /></div>
                      <button onClick={() => handleSaveInfoPengurus(role)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2"><Save size={14} /> Simpan Nama</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}