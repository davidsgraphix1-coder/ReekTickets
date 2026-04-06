const fs = require('fs');
const path = require('path');

try {
  const baseUrl = 'https://reektickets.com';
  const routes = [
    '/',
    '/events',
    '/login',
    '/signup',
    '/dashboard',
    '/vendor',
    '/admin',
    '/vendor/register',
    '/agents',
    '/create-event',
    '/my-tickets',
    '/blog',
    '/blog/top-events-in-accra-2026',
    '/blog/best-concerts-in-ghana',
    '/blog/upcoming-events-in-ghana',
  ];

  const urls = routes.map((route) => `  <url>\n    <loc>${baseUrl}${route}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

  // Ensure public directory exists
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, sitemap, 'utf8');
  console.log(`Sitemap generated at ${outputPath}`);
} catch (error) {
  console.error('Failed to generate sitemap:', error.message);
  // Don't exit with error, just log and continue
  process.exit(0);
}
