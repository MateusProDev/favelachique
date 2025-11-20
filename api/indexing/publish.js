// Serverless API to publish URLs to Google's Indexing API
// POST /api/indexing/publish
// Body JSON: { url: string, type?: 'URL_UPDATED' | 'URL_DELETED' }

// Try to require google-auth-library at module load so Vercel includes it in the function bundle.
let GoogleAuth;
try {
  GoogleAuth = require('google-auth-library').GoogleAuth;
} catch (e) {
  GoogleAuth = null;
  console.warn('google-auth-library not available at module load:', e && e.message);
}

module.exports = async (req, res) => {
  // Basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // Temporary diagnostic: accept GET to confirm this file is deployed and reachable.
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, route: '/api/indexing/publish', method: 'GET' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Support cases where the platform didn't parse the JSON body (some clients/terminals
    // may send malformed JSON due to quoting). Try to use req.body first, otherwise
    // read the raw request stream and parse it as JSON.
    let body = req.body;
    if (!body || (typeof body === 'object' && Object.keys(body).length === 0)) {
      try {
        body = await new Promise((resolve, reject) => {
          let raw = '';
          req.on('data', (chunk) => { raw += chunk; });
          req.on('end', () => resolve(raw));
          req.on('error', reject);
        });
        if (typeof body === 'string' && body.length) {
          try { body = JSON.parse(body); } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON' });
          }
        }
      } catch (e) {
        console.error('Error reading raw body:', e && e.message);
      }
    }

    const { url, type = 'URL_UPDATED' } = body || {};
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing or invalid "url" in body' });
    if (!['URL_UPDATED', 'URL_DELETED'].includes(type)) return res.status(400).json({ error: 'Invalid type. Use URL_UPDATED or URL_DELETED' });

    // Read credentials from env (store full JSON string in Vercel env var)
    const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!raw) return res.status(500).json({ error: 'Missing Google service account credentials in env (GOOGLE_APPLICATION_CREDENTIALS_JSON)' });

    let credentials = raw;
    if (typeof raw === 'string') {
      try {
        credentials = JSON.parse(raw);
      } catch (e) {
        // raw may be a path (not expected in Vercel). If so, let GoogleAuth handle default creds.
        credentials = raw;
      }
    }

    if (!GoogleAuth) {
      console.error('google-auth-library is not available at runtime.');
      return res.status(500).json({ error: 'Server misconfiguration: google-auth-library not available' });
    }

    const auth = new GoogleAuth({
      credentials: typeof credentials === 'object' ? credentials : undefined,
      scopes: ['https://www.googleapis.com/auth/indexing']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    const token = accessToken && (accessToken.token || accessToken);

    const fetchRes = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, type })
    });

    const text = await fetchRes.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) { data = text; }

    return res.status(fetchRes.status).json({ status: fetchRes.status, data });
  } catch (err) {
    console.error('Indexing publish error:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
