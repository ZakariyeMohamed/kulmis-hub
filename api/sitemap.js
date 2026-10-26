
const urls = [];

const staticPages = [
  "",
  "nagu-saabsan",
  "deeqo-waxbarasho",
  "fursadaha-shaqo",
  "seminars",
  "adeegyadeena",
  "nala-soo-xiriir"
];

for (const page of staticPages) {
  const pageUrl = page
    ? `${SITE_URL}/${page}`
    : `${SITE_URL}/`;

  urls.push(`
    <url>
      <loc>${pageUrl}</loc>
    </url>
  `);
}

for (const post of posts) {
  const slug = createPostSlug(post.title);
  if (!slug) continue;

  const lastmod = post.created_at
    ? new Date(post.created_at).toISOString()
    : new Date().toISOString();

  urls.push(`
    <url>
      <loc>${SITE_URL}/${encodeURIComponent(slug)}</loc>
      <lastmod>${lastmod}</lastmod>
    </url>
  `);
}
