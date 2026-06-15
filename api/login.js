// api/login.js — Vercel Serverless Function
// Password divalidasi di SERVER, tidak pernah dikirim ke browser

const ADMIN_ACCOUNTS = [
  { username: 'admin', password: '1223334444' },
  { username: 'seliya', password: '123' },
  // Tambah akun di sini — file ini hanya ada di server
];

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  const match = ADMIN_ACCOUNTS.find(
    (acc) => acc.username === username && acc.password === password
  );

  if (match) {
    // Di produksi: gunakan JWT atau session cookie yang proper
    return res.status(200).json({ success: true, message: 'Login berhasil' });
  } else {
    return res.status(401).json({ success: false, message: 'Username atau password salah' });
  }
}