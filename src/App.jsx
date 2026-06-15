import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Beranda from './pages/Beranda';
import Information from './pages/Information';
import SeputarHimmah from './pages/SeputarHimmah';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-[#004d24] font-poppins flex flex-col">
      {/* DevelopmentAlert dihapus — website sudah siap produksi */}
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"              element={<Beranda />} />
          <Route path="/informasi"     element={<Information />} />
          <Route path="/berita"        element={<SeputarHimmah />} />
          <Route path="/berita/:id"    element={<SeputarHimmah />} />
          <Route path="/admin"  element={<Admin />} />
          <Route path="*"              element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}