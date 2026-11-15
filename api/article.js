
const SUPABASE_URL = "https://wxamihjterffxrnpqxwt.supabase.co";
const SUPABASE_KEY = "sb_publishable_KXBcUODUGXrWUTY70jNPvw_2SwNy-A1";
const SITE_URL = "https://kulmishub.com";

function slugify(title) {
  return String(title || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function postSlug(row) {
  const title = row.title || row.program || row.company || "";
  if (/un\s*volunteers/i.test(title)) {
    return "un-volunteers-20262027-shuruudaha-iyo-sida-loo-codsado";
  }
  return slugify(title);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

module.exports = async function handler(req, res) {
  try {
    const slug = String(req.query.slug || "").toLowerCase();

    const response = await fetch(
      SUPABASE_URL +
      "/rest/v1/opportunities?select=*&published=eq.true",
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: "Bearer " + SUPABASE_KEY
        }
      }
    );

    if (!response.ok) throw new Error("Database error");

    const posts = await response.json();
    const post = posts.find(item => postSlug(item) === slug);

    if (!post) {
      return res.status(404).send("Maqaalka lama helin.");
    }

    const title = post.title || "Kulmis Hub";
    const description = String(post.description || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const seoTitle = post.seo_title || title + " | Kulmis Hub";
    const metaDescription =
      post.meta_description || description.slice(0, 160);

    const canonical = SITE_URL + "/" + slug;

    const body = `
      <!DOCTYPE html>
      <html lang="so">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHTML(seoTitle)}</title>
        <meta name="description" content="${escapeHTML(metaDescription)}">
        <link rel="canonical" href="${canonical}">
        <meta property="og:type" content="article">
        <meta property="og:title" content="${escapeHTML(seoTitle)}">
        <meta property="og:description" content="${escapeHTML(metaDescription)}">
        <meta property="og:url" content="${canonical}">
        ${post.image_url ? `<meta property="og:image" content="${escapeHTML(post.image_url)}">` : ""}
        <style>
          body{font-family:Arial,sans-serif;max-width:850px;
          margin:30px auto;padding:20px;line-height:1.8;color:#172b4d}
          h1{color:#2459ad}
          img{max-width:100%;height:auto;border-radius:12px}
          .article{white-space:pre-wrap}
        </style>
      </head>
      <body>
        <p><a href="/">← Kulmis Hub</a></p>
        ${post.image_url ? `<img src="${escapeHTML(post.image_url)}" alt="${escapeHTML(title)}">` : ""}
        <h1>${escapeHTML(title)}</h1>
        ${post.country ? `<p><b>Wadanka:</b> ${escapeHTML(post.country)}</p>` : ""}
        <div class="article">${escapeHTML(description)}</div>
        <hr>
        <p>Kulmis Hub – Halkani waa Hoyga fursadaha caalamiga ah.</p>
      </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).send(body);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Cilad ayaa dhacday.");
  }
};
