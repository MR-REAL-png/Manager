export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64, systemPrompt } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'API key tidak ditemukan' });

    const instruction = 'Ekstrak data transaksi dari gambar struk/nota ini. Kembalikan HANYA JSON valid, tanpa teks lain, tanpa backtick, tanpa penjelasan. ' + systemPrompt;

    const parts = [
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      { text: instruction }
    ];

    // Retry logic: max 3x, tunggu 5 detik jika kena 429
    let data;
    const MAX_RETRY = 3;
    const RETRY_DELAY = 5000;

    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
      const geminiRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: parts }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 512 }
          })
        }
      );

      data = await geminiRes.json();
      console.log(`Gemini attempt ${attempt}:`, JSON.stringify(data).slice(0, 300));

      // Jika 429, tunggu lalu retry
      if (data.error?.code === 429) {
        if (attempt < MAX_RETRY) {
          console.log(`Rate limited, menunggu ${RETRY_DELAY / 1000} detik...`);
          await new Promise(r => setTimeout(r, RETRY_DELAY));
          continue;
        } else {
          return res.status(429).json({ error: 'Server sedang sibuk, coba beberapa saat lagi.' });
        }
      }

      // Jika error lain, langsung return
      if (data.error) return res.status(500).json({ error: data.error.message });

      // Sukses, keluar dari loop
      break;
    }

    const rawText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
      ? data.candidates[0].content.parts[0].text
      : '';

    if (!rawText) return res.status(500).json({ error: 'Gemini tidak menghasilkan teks' });

    // Cari JSON di dalam teks
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Tidak ditemukan JSON: ' + rawText.slice(0, 100) });

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);

  } catch (e) {
    console.error('parse-image error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
