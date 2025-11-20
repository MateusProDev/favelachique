// Vercel Serverless function that returns an XML sitemap
// Accessible at: /api/sitemap.xml (and via rewrite to /sitemap.xml)

const fetch = globalThis.fetch || require('node-fetch');

module.exports = async (req, res) => {
  try {
    const host = process.env.NEXT_PUBLIC_BASE_URL || (req.headers.host ? `https://${req.headers.host}` : 'https://<your-domain>');

    // static routes to include in the sitemap (removed admin inicializador)
    const staticRoutes = [
      '/',
      '/sobre',
      '/pacotes',
      '/blog',
      '/contato',
      '/reservas',
      '/politica'
    ];

    let dynamicRoutes = [];

    // Optional: try to fetch blog posts from Firestore (public) using REST API
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (projectId && apiKey) {
      try {
        const docsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts`;
        const r = await fetch(docsUrl);
        if (r.ok) {
          const data = await r.json();
          if (Array.isArray(data.documents)) {
            dynamicRoutes = data.documents.map((d) => {
              const slug = d.fields?.slug?.stringValue;
              return slug ? `/blog/${slug}` : null;
            }).filter(Boolean);
          }
        }
      } catch (e) {
        // ignore Firestore errors; sitemap will include static routes
        console.error('Error fetching posts for sitemap:', e);
      }
    }

    // merge routes, remove falsy, ensure unique and sorted for consistent output
    const urls = [...new Set([...staticRoutes, ...dynamicRoutes].filter(Boolean))].sort();

    const urlEntries = urls.map((u) => {
      const loc = `${host.replace(/\/$/, '')}${u}`;
      return `  <url>\n    <loc>${loc}</loc>\n  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (err) {
    console.error('sitemap error', err);
    res.status(500).send('Internal Server Error');
  }
};
