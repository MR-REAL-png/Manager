const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

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

    // GET - ambil transaksi (filter by input_by kalau bukan viewer)
    if (req.method === 'GET' && action === 'get') {
      const { uid, role, group_id } = req.query;

      let query = supabase.from('transaksi').select('*').order('tanggal', { ascending: false });

      if (role === 'viewer' && group_id) {
        // Viewer: ambil semua transaksi semua anggota group
        const { data: members } = await supabase
          .from('users')
          .select('username')
          .eq('group_id', group_id)
          .eq('role', 'member');
        const usernames = (members || []).map(m => m.username);
        if (usernames.length) query = query.in('input_by', usernames);
      } else if (uid) {
        // User biasa: hanya data milik sendiri
        query = query.eq('input_by', uid);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    // APPEND - tambah transaksi baru
    if (req.method === 'POST' && action === 'append') {
      const { values, username } = req.body;
      const rows = values.map(v => ({
        tanggal:    v[0],
        bulan:      v[1],
        kategori:   v[2],
        nominal:    v[3],
        pembayaran: v[4],
        detail:     v[5],
        metode:     v[6],
        jenis:      v[7],
        input_by:   username || null,
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
      const { id, values, username } = req.body;
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

      let query = supabase.from('transaksi').update(row).eq('id', id);
      // Pastikan hanya bisa edit milik sendiri
      if (username) query = query.eq('input_by', username);

      const { data, error } = await query.select();
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    // DELETE - hapus transaksi berdasarkan id
    if (req.method === 'DELETE' && action === 'delete') {
      const { id, username } = req.body;

      let query = supabase.from('transaksi').delete().eq('id', id);
      if (username) query = query.eq('input_by', username);

      const { error } = await query;
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // ═══ SETTINGS ═══

    // GET SETTINGS
    if (req.method === 'GET' && action === 'get-settings') {
      const { uid } = req.query;
      if (!uid) return res.status(400).json({ error: 'uid required' });

      const { data, error } = await supabase
        .from('user_settings')
        .select('data, updated_at')
        .eq('id', uid)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return res.status(200).json({ success: true, data: data?.data || null, updated_at: data?.updated_at || null });
    }

    // SAVE SETTINGS
    if (req.method === 'POST' && action === 'save-settings') {
      const { uid, data: settingsData } = req.body;
      if (!uid) return res.status(400).json({ error: 'uid required' });

      const { error } = await supabase
        .from('user_settings')
        .upsert({ id: uid, data: settingsData, updated_at: new Date().toISOString() });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // ═══ AUTH ═══

    // REGISTER - daftar user baru
    if (req.method === 'POST' && action === 'register') {
      const { username, pin } = req.body;
      if (!username || !pin) return res.status(400).json({ error: 'username dan pin wajib diisi' });
      if (pin.length !== 6) return res.status(400).json({ error: 'PIN harus 6 digit' });

      const { data: existing } = await supabase
        .from('users').select('username').eq('pin', pin).single();
      if (existing) return res.status(400).json({ error: 'PIN sudah digunakan, pilih PIN lain' });

      const { error } = await supabase
        .from('users').insert({ username, pin, role: 'member' });

      if (error && error.code === '23505') return res.status(400).json({ error: 'Username sudah terdaftar' });
      if (error) throw error;
      return res.status(200).json({ success: true, username });
    }

    // LOGIN - verifikasi PIN, return group_id dan role
    if (req.method === 'POST' && action === 'login') {
      const { pin } = req.body;
      if (!pin || pin.length !== 6) return res.status(400).json({ error: 'PIN harus 6 digit' });

      const { data, error } = await supabase
        .from('users')
        .select('username, group_id, role')
        .eq('pin', pin)
        .single();

      if (error || !data) return res.status(401).json({ error: 'PIN salah' });
      return res.status(200).json({
        success: true,
        username: data.username,
        group_id: data.group_id || null,
        role: data.role || 'member'
      });
    }

    // CHANGE PIN
    if (req.method === 'POST' && action === 'changepin') {
      const { username, oldPin, newPin } = req.body;
      if (!username || !oldPin || !newPin) return res.status(400).json({ error: 'Data tidak lengkap' });
      if (newPin.length !== 6) return res.status(400).json({ error: 'PIN baru harus 6 digit' });

      const { data: user } = await supabase.from('users').select('username').eq('username', username).eq('pin', oldPin).single();
      if (!user) return res.status(401).json({ error: 'PIN lama salah' });

      const { data: conflict } = await supabase.from('users').select('username').eq('pin', newPin).single();
      if (conflict && conflict.username !== username) return res.status(400).json({ error: 'PIN sudah digunakan user lain' });

      const { error } = await supabase.from('users').update({ pin: newPin }).eq('username', username);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // ═══ GROUP ═══

    // CREATE GROUP - buat group baru, generate group_id + akun viewer
    if (req.method === 'POST' && action === 'create-group') {
      const { username, viewerPin } = req.body;
      if (!username || !viewerPin) return res.status(400).json({ error: 'Data tidak lengkap' });
      if (viewerPin.length !== 6) return res.status(400).json({ error: 'PIN viewer harus 6 digit' });

      // Cek user ada
      const { data: user } = await supabase.from('users').select('username, group_id').eq('username', username).single();
      if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
      if (user.group_id) return res.status(400).json({ error: 'Kamu sudah punya group' });

      // Cek PIN viewer tidak bentrok
      const { data: pinConflict } = await supabase.from('users').select('username').eq('pin', viewerPin).single();
      if (pinConflict) return res.status(400).json({ error: 'PIN viewer sudah digunakan' });

      // Generate group_id unik
      const group_id = 'GRP' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const viewerUsername = `viewer_${group_id}`;

      // Update user jadi admin group
      await supabase.from('users').update({ group_id, role: 'member' }).eq('username', username);

      // Buat akun viewer
      const { error: viewerError } = await supabase.from('users').insert({
        username: viewerUsername,
        pin: viewerPin,
        group_id,
        role: 'viewer'
      });
      if (viewerError) throw viewerError;

      return res.status(200).json({ success: true, group_id, viewerUsername });
    }

    // JOIN GROUP - user lain bergabung ke group
    if (req.method === 'POST' && action === 'join-group') {
      const { username, group_id } = req.body;
      if (!username || !group_id) return res.status(400).json({ error: 'Data tidak lengkap' });

      // Cek group ada
      const { data: groupMembers } = await supabase
        .from('users').select('username').eq('group_id', group_id).eq('role', 'member');
      if (!groupMembers || groupMembers.length === 0)
        return res.status(404).json({ error: 'Group tidak ditemukan' });

      // Cek user belum punya group
      const { data: user } = await supabase.from('users').select('group_id').eq('username', username).single();
      if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
      if (user.group_id) return res.status(400).json({ error: 'Kamu sudah bergabung di group lain' });

      // Join group
      const { error } = await supabase.from('users').update({ group_id, role: 'member' }).eq('username', username);
      if (error) throw error;
      return res.status(200).json({ success: true, group_id });
    }

    // GET GROUP MEMBERS - ambil semua anggota group
    if (req.method === 'GET' && action === 'get-group-members') {
      const { group_id } = req.query;
      if (!group_id) return res.status(400).json({ error: 'group_id required' });

      const { data, error } = await supabase
        .from('users')
        .select('username, role')
        .eq('group_id', group_id)
        .eq('role', 'member');

      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }

    // GET GROUP TRANSFERS - ambil transfers semua anggota (untuk viewer)
    if (req.method === 'GET' && action === 'get-group-transfers') {
      const { group_id } = req.query;
      if (!group_id) return res.status(400).json({ error: 'group_id required' });

      const { data: members } = await supabase
        .from('users').select('username').eq('group_id', group_id).eq('role', 'member');
      const usernames = (members || []).map(m => m.username);

      if (!usernames.length) return res.status(200).json({ success: true, data: [] });

      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .in('input_by', usernames)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }

    // ═══ TRANSFERS ═══

    // GET TRANSFERS
    if (req.method === 'GET' && action === 'get-transfers') {
      const { uid } = req.query;
      if (!uid) return res.status(400).json({ error: 'uid required' });
      const { data, error } = await supabase
        .from('transfers')
        .select('*')
        .eq('user_id', uid)
        .order('tanggal', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }

    // SAVE TRANSFER
    if (req.method === 'POST' && action === 'save-transfer') {
      const { uid, dari, ke, nominal, catatan, tanggal } = req.body;
      if (!uid || !dari || !ke || !nominal || !tanggal)
        return res.status(400).json({ error: 'Data tidak lengkap' });
      const { error } = await supabase
        .from('transfers')
        .insert({ user_id: uid, dari, ke, nominal, catatan, tanggal, input_by: uid });
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // UPDATE TRANSFER
    if (req.method === 'PUT' && action === 'update-transfer') {
      const { uid, id, dari, ke, nominal, catatan, tanggal } = req.body;
      if (!uid || !id) return res.status(400).json({ error: 'Data tidak lengkap' });
      const { error } = await supabase
        .from('transfers')
        .update({ dari, ke, nominal, catatan, tanggal })
        .eq('id', id)
        .eq('user_id', uid);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    // DELETE TRANSFER
    if (req.method === 'DELETE' && action === 'delete-transfer') {
      const { uid, id } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { error } = await supabase
        .from('transfers')
        .delete()
        .eq('id', id)
        .eq('user_id', uid);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: error.message });
  }
};
