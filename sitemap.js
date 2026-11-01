const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const SITE_URL = "https://kulmishub.com";

function createPostSlug(title) {
  return String(title || "post")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

module.exports = async function handler(req, res) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/opportunities?select=title,created_at,published&published=eq.true&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Supabase request failed");
    }

    const posts = await response.json();

    const urls = [
      `
      <url>
        <loc>${SITE_URL}/</loc>
      </url>
      `
    ];

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

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

    return res.status(200).send(xml);

  } catch (error) {
    console.error(error);

    return res.status(500).send(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>Sitemap generation failed</error>`
    );
  }
};
