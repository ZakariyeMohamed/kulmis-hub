
const SUPABASE_URL = "https://wxamihjterffxrnpqxwt.supabase.co";
const SUPABASE_KEY = "sb_publishable_KXBcUODUGXrWUTY70jNPvw_2SwNy-A1";

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

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

module.exports = async function handler(req, res) {
  try {
    const supabaseEndpoint =
      SUPABASE_URL +
      "/rest/v1/opportunities?select=title,created_at&published=eq.true&order=created_at.desc";

    const response = await fetch(supabaseEndpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY
      }
    });

    if (!response.ok) {
      throw new Error(
        "Supabase request failed: " + response.status
      );
    }

    const posts = await response.json();
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
          <loc>${escapeXml(pageUrl)}</loc>
        </url>
      `);
    }

    for (const post of posts) {
      const slug = createPostSlug(post.title);
      if (!slug) continue;

      const postUrl = `${SITE_URL}/${encodeURIComponent(slug)}`;

      const lastmod = post.created_at
        ? new Date(post.created_at).toISOString()
        : null;

      urls.push(`
        <url>
          <loc>${escapeXml(postUrl)}</loc>
          ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
        </url>
      `);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    res.setHeader(
      "Content-Type",
      "application/xml; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400"
    );

    return res.status(200).send(xml);

  } catch (error) {
    console.error("Sitemap generation failed:", error);

    res.setHeader(
      "Content-Type",
      "application/xml; charset=utf-8"
    );

    return res.status(500).send(
      `<?xml version="1.0" encoding="UTF-8"?>
<error>Sitemap generation failed</error>`
    );
  }
};
