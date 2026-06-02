const { google } = require('googleapis');

const SHEET_ID = '1bjeestIs-wvjxQtmkrLuf39KNOssgzHMTkC4xpTBzzY';

const credentials = {
  type: "service_account",
  project_id: "money-manage-498002",
  private_key_id: "3a6a753334d11bd13bfeb9fb0863b5f78faf359b",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7dKD7PtcSGcwJ\n3qkAvBzgYpKN7ynt8NQ/71Thue7ruST3xFQ68zTO2pZvGpIHt0utbRxTY1qNoZtZ\ndYQWj+8JlhY5hTIgNAbqWo7TOFfoxtb09ZsZ9pYdhE0NCVHYMMFPD2Uf8IpEqd4k\n60Jzm2/mEt9iHwymVY58pP9DVqgdrXkC+WOZ0tYxIJgnLvF8GTMxZcuEkikqzeM3\nlMPKqZ5lAQFm/ZzEMZfhiWnlHtw2otUEg8TPbT4ccxShukpPpv7nnEaNsneToWXB\no5uVkZmY457jUCuB2ogJFRNcs4hOA/9knHZKadER2D6mp4tOOCCq7iuwp71xlp0v\nL8odNrO1AgMBAAECggEAKmExPewUko6LfxW8TqK4wo/2gyk1aQpf6f5xScEP/3Hx\npiRYSKWQZE2t4ft3VVA+xzwaQc39/HQzW3PCg5lR2PB6INH4pagtghEsJhugYEuH\n8ISQZrvFb3HoO5DGVKKdKYMZATIQCHsA8obPlLRpBXJx10yevwIrvwlMfoxaYK7i\ns/Z1HFev2talHYxq65j+ThjL0XlB8idmzJ8sZcULTEj0X0AIaawuVtZnAizPkpvi\nsPGJe8l4wq1aPpTdNmYRelNNA7bwwetXIlepN57rnwHgWibRdFuhEJ22CH2OUNQ/\nU0Nm3AzdSfF9xM7JWM7gZFsQLy7YPvfDear6CLiaxwKBgQDmtbq3IVqYBLBo35XX\nQ/m15ZYf2BluQffSKunUOJcY5/XpzQ/rOD9DRtOibArGKpYEEgnQFAa9MX3flcyb\nZFNPt0z8uqlAe6+5KEYjFh2FYIcHw4+dr8+ZrOcjDGGWR4iH3RltS++/7SUrmBLd\n55ryf6F+AvVeqqSeLdT7FU4O1wKBgQDQARSZtcjH8IbR2GnQH0Lrc2BMQEisMuR6\nL5iCKsSa33sGdTtJUDk0bHYT5qisRbdalkJzmVrU2hev17z/UWr+mbNvQ/3u4eWL\nSuIYihgloz5fm/YE3yn2uh++A4+WkOd4IBB4k5CrXtOdLCJG3Noz8dMtuMV/jFRT\njnlRd868UwKBgDNy/XOPbZuPGCQbEFhUIWDOFT9+upUbAwAMb97Sy+dS+0UrZMxo\n27rOFa4X+AMfRhscRrHvdV1FpzNwPZO9uNKDJxkJK2tk6dgZwiJa8TRoRVSW6PUa\nWuqDY3wua6jOxQS/ascz8wBTC0IAhNyVpLlFeycV09BLr7BSujdQFfs7AoGAI9rb\n0zc7ugNjKg8VBlQtM+r6gYpfPJe1PL6xmlaG929ohI92vcd/ZOMBY6LSFogZ+BqI\nr+aSerhxdtVIdfZx7BtQi/B7eE8mQ2GQIczEJtDB8rcurF5PnIEu8ZEpkjm+PL3C\nORauzGuXLLOr4O03C9c2oN4F5VuqOZEIpptxXpMCgYAFlE+JlIvNej+FnCoAYso1\n/m9xcNACId+a9t/KRwBjzWo5ReM6zPEYCsU5BOX008KWVPocn+PZvZw+Y2pxU2fd\nETx2gRr5ybohAcdm0hb++wGDLhCld5XyScr/OUrlxjoIiFdG0/kn7BT2aOruznp8\nV3MmQjf+DO/m4fNUXMLx4Q==\n-----END PRIVATE KEY-----\n",
  client_email: "money-manager-sheets@money-manage-498002.iam.gserviceaccount.com",
  client_id: "110588139855657136887",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/money-manager-sheets%40money-manage-498002.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const { action } = req.query;

    // APPEND - tambah transaksi baru
    if (req.method === 'POST' && action === 'append') {
      const { values } = req.body;
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: 'DATA!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
      return res.status(200).json({ success: true, data: response.data });
    }

    // UPDATE - edit atau hapus transaksi
    if (req.method === 'PUT' && action === 'update') {
      const { range, values } = req.body;
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
      return res.status(200).json({ success: true, data: response.data });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Sheets API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

