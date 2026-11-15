
const SUPABASE_URL = "https://wxamihjterffxrnpqxwt.supabase.co";
const SUPABASE_KEY = "sb_publishable_KXBcUODUGXrWUTY70jNPvw_2SwNy-A1";
const SITE_URL = "https://kulmishub.com";

function createPostSlug(title) {
  return String(title || "post")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function safeURL(value) {
  try {
    const url = new URL(String(value || ""));
    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function plainText(value) {
  return String(value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanArticleHTML(value) {
  let html = String(value || "");

  html = html.replace(
    /<(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi,
    ""
  );

  html = html.replace(
    /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
    ""
  );

  html = html.replace(
    /\s+(href|src)\s*=\s*(['"])\s*(javascript|data):[\s\S]*?\2/gi,
    ""
  );

  return html;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).send("Method not allowed.");
    }

    const slug = String(req.query.slug || "").trim().toLowerCase();

    if (!slug) {
      return res.status(400).send("Article URL is missing.");
    }

    const endpoint =
      SUPABASE_URL +
      "/rest/v1/opportunities?select=*&published=eq.true&order=created_at.desc&limit=1000";

    const response = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY
      }
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Supabase error:", response.status, details);
      throw new Error("Could not read Supabase articles.");
    }

    const posts = await response.json();

    const post = posts.find(row => {
      const title =
        row.title || row.program || row.company || "Fursad";

      const possibleSlugs = [
        row.slug,
        createPostSlug(title),
        createPostSlug(row.seo_title),
        createPostSlug(row.program),
        createPostSlug(row.company)
      ].filter(Boolean);

      return possibleSlugs.includes(slug);
    });

    if (!post) {
      return res.status(404).send(`<!DOCTYPE html>
<html lang="so">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Maqaal lama helin | Kulmis Hub</title>
</head>
<body>
<h1>Maqaalka lama helin</h1>
<a href="/">Ku noqo Kulmis Hub</a>
</body>
</html>`);
    }

    const title =
      post.title || post.program || post.company || "Fursad";

    const seoTitle =
      post.seo_title || title + " | Kulmis Hub";

    const description = plainText(post.description);

    const metaDescription = String(
      post.meta_description || description
    ).slice(0, 300);

    const image = safeURL(post.image_url);
    const applyLink = safeURL(post.link);

    const canonical =
      SITE_URL + "/" + createPostSlug(title);

    const articleHTML = cleanArticleHTML(post.description);

    const html = `<!DOCTYPE html>
<html lang="so">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>${escapeHTML(seoTitle)}</title>
<meta name="description" content="${escapeHTML(metaDescription)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${escapeHTML(canonical)}">

<meta property="og:site_name" content="KULMIS HUB">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHTML(seoTitle)}">
<meta property="og:description" content="${escapeHTML(metaDescription)}">
<meta property="og:url" content="${escapeHTML(canonical)}">
${image ? `<meta property="og:image" content="${escapeHTML(image)}">` : ""}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHTML(seoTitle)}">
<meta name="twitter:description" content="${escapeHTML(metaDescription)}">
${image ? `<meta name="twitter:image" content="${escapeHTML(image)}">` : ""}

<style>
*{box-sizing:border-box}
body{
  margin:0;
  background:#f6f8fc;
  color:#102a56;
  font-family:Arial,sans-serif
}
header{
  background:#fff;
  padding:18px 5%;
  border-bottom:1px solid #ddd
}
header a{
  font-weight:bold;
  color:#102a56;
  text-decoration:none
}
main{
  max-width:900px;
  margin:30px auto;
  padding:25px;
  background:white;
  border-radius:14px
}
h1{
  font-size:clamp(27px,5vw,40px);
  line-height:1.35;
  color:#2563eb
}
.post-image{
  width:100%;
  height:auto;
  max-height:440px;
  object-fit:cover;
  border-radius:12px
}
.article{
  font-size:18px;
  line-height:1.9;
  color:#171717;
  overflow-wrap:anywhere
}
.article img{
  max-width:100%;
  height:auto
}
.article p{margin:0 0 18px}
.article a{color:#2563eb}
.apply{
  display:inline-block;
  margin-top:25px;
  background:#2563eb;
  color:white;
  padding:13px 22px;
  border-radius:8px;
  text-decoration:none
}
footer{
  text-align:center;
  padding:25px;
  color:#687386
}
@media(max-width:600px){
  main{margin:12px;padding:18px}
  .article{font-size:17px}
}
</style>
</head>

<body>
<header><a href="/">KULMIS HUB</a></header>

<main>
${image ? `<img class="post-image" src="${escapeHTML(image)}" alt="${escapeHTML(title)}">` : ""}

<h1>${escapeHTML(title)}</h1>

${post.country ? `<p><b>Wadanka:</b> ${escapeHTML(post.country)}</p>` : ""}
${post.location ? `<p><b>Goobta:</b> ${escapeHTML(post.location)}</p>` : ""}
${post.deadline ? `<p><b>Deadline:</b> ${escapeHTML(post.deadline)}</p>` : ""}

<article class="article">${articleHTML}</article>

${applyLink ? `<a class="apply" href="${escapeHTML(applyLink)}" target="_blank" rel="noopener noreferrer">Official / Apply</a>` : ""}
</main>

<footer>
Kulmis Hub — Halkani waa Hoyga fursadaha caalamiga ah.
</footer>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    return res.status(200).send(html);

  } catch (error) {
    console.error("Article error:", error);

    return res.status(500).send(
      "Cilad ayaa dhacday. Fadlan mar kale isku day."
    );
  }
};
