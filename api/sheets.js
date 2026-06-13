const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action } = req.query;

    // GET - ambil semua transaksi
    if (req.method === 'GET' && action === 'get') {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    // APPEND - tambah transaksi baru
    if (req.method === 'POST' && action === 'append') {
      const { values } = req.body;
      const rows = values.map(v => ({
        tanggal:    v[0],
        bulan:      v[1],
        kategori:   v[2],
        nominal:    v[3],
        pembayaran: v[4],
        detail:     v[5],
        metode:     v[6],
        jenis:      v[7],
      }));

      const { data, error } = await supabase
        .from('transaksi')
        .insert(rows)
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    // UPDATE - edit transaksi berdasarkan id
    if (req.method === 'PUT' && action === 'update') {
      const { id, values } = req.body;
      const row = {
        tanggal:    values[0],
        bulan:      values[1],
        kategori:   values[2],
        nominal:    values[3],
        pembayaran: values[4],
        detail:     values[5],
        metode:     values[6],
        jenis:      values[7],
      };

      const { data, error } = await supabase
        .from('transaksi')
        .update(row)
        .eq('id', id)
        .select();

      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    // DELETE - hapus transaksi berdasarkan id
    if (req.method === 'DELETE' && action === 'delete') {
      const { id } = req.body;

      const { error } = await supabase
        .from('transaksi')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // ═══ SETTINGS ═══

    // GET SETTINGS - ambil settings berdasarkan user id
    if (req.method === 'GET' && action === 'get-settings') {
      const { uid } = req.query;
      if (!uid) return res.status(400).json({ error: 'uid required' });

      const { data, error } = await supabase
        .from('user_settings')
        .select('data, updated_at')
        .eq('id', uid)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return res.status(200).json({ success: true, data: data?.data || null, updated_at: data?.updated_at || null });
    }

    // SAVE SETTINGS - simpan/update settings
    if (req.method === 'POST' && action === 'save-settings') {
      const { uid, data: settingsData } = req.body;
      if (!uid) return res.status(400).json({ error: 'uid required' });

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          id: uid,
          data: settingsData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // ═══ AUTH ═══

    // REGISTER - daftar user baru
    if (req.method === 'POST' && action === 'register') {
      const { username, pin } = req.body;
      if (!username || !pin) return res.status(400).json({ error: 'username dan pin wajib diisi' });
      if (pin.length !== 6) return res.status(400).json({ error: 'PIN harus 6 digit' });

      // Cek apakah PIN sudah dipakai user lain
      const { data: existing } = await supabase
        .from('users')
        .select('username')
        .eq('pin', pin)
        .single();
      if (existing) return res.status(400).json({ error: 'PIN sudah digunakan, pilih PIN lain' });

      const { error } = await supabase
        .from('users')
        .insert({ username, pin });

      if (error && error.code === '23505') return res.status(400).json({ error: 'Username sudah terdaftar' });
      if (error) throw error;
      return res.status(200).json({ success: true, username });
    }

    // LOGIN - verifikasi PIN, cari user yang cocok
    if (req.method === 'POST' && action === 'login') {
      const { pin } = req.body;
      if (!pin || pin.length !== 6) return res.status(400).json({ error: 'PIN harus 6 digit' });

      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('pin', pin)
        .single();

      if (error || !data) return res.status(401).json({ error: 'PIN salah' });
      return res.status(200).json({ success: true, username: data.username });
    }

    // CHANGE PIN
    if (req.method === 'POST' && action === 'changepin') {
      const { username, oldPin, newPin } = req.body;
      if (!username || !oldPin || !newPin) return res.status(400).json({ error: 'Data tidak lengkap' });
      if (newPin.length !== 6) return res.status(400).json({ error: 'PIN baru harus 6 digit' });

      // Verifikasi PIN lama
      const { data: user } = await supabase.from('users').select('username').eq('username', username).eq('pin', oldPin).single();
      if (!user) return res.status(401).json({ error: 'PIN lama salah' });

      // Cek PIN baru tidak bentrok dengan user lain
      const { data: conflict } = await supabase.from('users').select('username').eq('pin', newPin).single();
      if (conflict && conflict.username !== username) return res.status(400).json({ error: 'PIN sudah digunakan user lain' });

      const { error } = await supabase.from('users').update({ pin: newPin }).eq('username', username);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: error.message });
  }
};
