#!/usr/bin/env node
// Build-time SSG prerender for the GWP Vite SPA.
// Runs after `vite build` + copy-public-dotfiles. Reads the built shell
// (dist/apps/web/index.html), strips the route-VARYING head tags once, and
// writes a per-route dist/apps/web/<route>/index.html with that route's
// title/description/robots/canonical/OG/Twitter/JSON-LD. Apache's -f/-d
// pass-through in .htaccess serves these directly; unmapped paths keep
// falling back to the SPA shell.
//
// Meta is sourced from src/lib/routeMeta.js (single source of truth shared
// with the page <SEO> components) + src/lib/seo.js (schema builders) +
// src/data/blogPosts.js (blog) + the backend API (products + variant prices).
// Critical tags (title/description/canonical/robots) therefore cannot drift
// between the prerendered raw HTML and the hydrated DOM.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(toolsDir, '..');
const repoRoot = path.join(webRoot, '..', '..');
const outputDir = path.join(repoRoot, 'dist', 'apps', 'web');
const shellPath = path.join(outputDir, 'index.html');
const API_BASE = 'https://api.greatwildlifephotos.com';

const toUrl = (p) => pathToFileURL(p).href;
const seo = await import(toUrl(path.join(webRoot, 'src/lib/seo.js')));
const routeMeta = await import(toUrl(path.join(webRoot, 'src/lib/routeMeta.js')));
const blogMod = await import(toUrl(path.join(webRoot, 'src/data/blogPosts.js')));
const blogPosts = blogMod.blogPosts || blogMod.default;

const {
  absoluteUrl, truncateText, baseGraph, webPageSchema, breadcrumbSchema,
  articleSchema, productSchema, SITE_NAME,
} = seo;
const { STATIC_ROUTES, blogMeta, photoMeta, NOINDEX_ROUTES, NOINDEX_META } = routeMeta;

// Per-route schema.org @type (separate from og:type) — mirrors the page schema.
const SCHEMA_TYPE = {
  '/': 'WebPage',
  '/gallery': 'CollectionPage',
  '/about': 'AboutPage',
  '/faq': 'FAQPage',
  '/contact': 'ContactPage',
  '/blog': 'Blog',
  '/privacy': 'WebPage',
  '/terms': 'WebPage',
};

const BREADCRUMBS = {
  '/': [{ name: 'Home', path: '/' }],
  '/gallery': [{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }],
  '/about': [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }],
  '/faq': [{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }],
  '/contact': [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }],
  '/blog': [{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }],
  '/privacy': [{ name: 'Home', path: '/' }],
  '/terms': [{ name: 'Home', path: '/' }],
};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Build the route-varying head block (mirrors components/SEO.jsx exactly).
function headBlock({ title, description, path, image, type, robots }, schemaGraph) {
  const desc = truncateText(description);
  const canonical = absoluteUrl(path);
  const graph = schemaGraph.filter(Boolean);
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<meta name="robots" content="${esc(robots)}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:type" content="${esc(type)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:secure_url" content="${esc(image)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:url" content="${esc(canonical)}" />`,
    graph.length
      ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`
      : '',
  ].filter(Boolean).join('\n    ');
}

// Build the static template once: the shell with route-varying tags stripped.
function buildTemplate(shell) {
  // Remove route-varying tags from the head. Keep everything route-invariant
  // (charset, viewport, theme-color, favicon, preconnects, CSP, GA gtag,
  // agency attribution meta, the built JS bundle, #root).
  let t = shell
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:[^"']*["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*>\s*/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');
  if (!t.includes('<!--PRERENDER-INJECT-->')) {
    t = t.replace(/<\/head>/i, '<!--PRERENDER-INJECT-->\n  </head>');
  }
  return t;
}

function writeRoute(routePath, html) {
  const dir = routePath === '/' ? outputDir : path.join(outputDir, routePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

// Body content for crawlers.
//
// The prerender used to inject head tags only, leaving <div id="root"></div>
// empty — so every page served a correct <head> and zero words of body text to
// anything that does not execute JavaScript. Google renders JS eventually;
// Bing largely does not, and AI and social scrapers do not at all.
//
// React mounts with createRoot, which clears the container, so visitors still
// get the full app and there is no hydration mismatch. Everything below is
// generated from the SAME data the page renders, so the markup cannot drift
// away from what a visitor actually sees.
function bodyBlock(html) {
  return html ? html.trim() : '';
}

const money = (n) => `$${Number(n).toFixed(2)}`;

function photoBody(photo, offerPrices, canonicalPath) {
  const img = photo.r2_url || photo.photo_url || '';
  const prices = offerPrices.filter((n) => Number.isFinite(n) && n > 0);
  const lo = prices.length ? Math.min(...prices) : null;
  const hi = prices.length ? Math.max(...prices) : null;
  return bodyBlock(`
    <article>
      <nav aria-label="Breadcrumb">
        <a href="/">Home</a> &rsaquo; <a href="/gallery/">Gallery</a> &rsaquo;
        <span>${esc(photo.title)}</span>
      </nav>
      <h1>${esc(photo.title)}</h1>
      ${photo.category ? `<p><strong>Collection:</strong> ${esc(photo.category)}</p>` : ''}
      ${img ? `<img src="${esc(img)}" alt="${esc(photo.title)} — wildlife photography print by Lynn Starnes"${photo.width ? ` width="${photo.width}"` : ''}${photo.height ? ` height="${photo.height}"` : ''} />` : ''}
      ${photo.description ? `<p>${esc(photo.description)}</p>` : ''}
      ${lo !== null ? `<p><strong>Fine art prints from ${money(lo)}${hi && hi > lo ? ` to ${money(hi)}` : ''}</strong> — available on canvas, acrylic and aluminium.</p>` : ''}
      <p>Photographed by Lynn Starnes. Every print is produced to order on museum-quality materials.</p>
      <p><a href="${esc(canonicalPath)}/">View print options and pricing</a></p>
    </article>
  `);
}

function galleryBody(products) {
  const items = products.slice(0, 200).map((p) =>
    `<li><a href="/photo/${esc(p.slug)}/">${esc(p.title)}</a>${p.category ? ` &mdash; ${esc(p.category)}` : ''}</li>`
  ).join('\n        ');
  const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
  return bodyBlock(`
    <main>
      <h1>Wildlife Photography Print Gallery</h1>
      <p>${products.length} fine art wildlife and landscape photographs by Lynn Starnes, available as
      canvas, acrylic and aluminium prints.</p>
      ${cats.length ? `<h2>Collections</h2>\n      <ul>\n        ${cats.map((c) => `<li>${esc(c)}</li>`).join('\n        ')}\n      </ul>` : ''}
      <h2>All photographs</h2>
      <ul>
        ${items}
      </ul>
    </main>
  `);
}

function articleBody(post, path) {
  const body = (post.content || post.excerpt || '').toString();
  const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return bodyBlock(`
    <article>
      <nav aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/blog/">Blog</a></nav>
      <h1>${esc(post.title)}</h1>
      ${post.date ? `<p><time>${esc(post.date)}</time></p>` : ''}
      ${post.image ? `<img src="${esc(post.image)}" alt="${esc(post.title)}" />` : ''}
      <p>${esc(text.slice(0, 2000))}</p>
      <p><a href="${esc(path)}/">Read the full article</a></p>
    </article>
  `);
}

function renderRoute(template, meta, schemaGraph, body) {
  let out = template.replace('<!--PRERENDER-INJECT-->', '    ' + headBlock(meta, schemaGraph));
  if (body) {
    out = out.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  }
  return out;
}

async function fetchJson(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'GWP-prerender/1.0' } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

// concurrency-limited map
async function pool(items, limit, fn) {
  const out = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx).catch((e) => { console.warn('  skip:', e.message); return null; });
    }
  });
  await Promise.all(workers);
  return out;
}

async function main() {
  if (!fs.existsSync(shellPath)) {
    console.error(`ABORT: built shell not found at ${shellPath} (run vite build first)`);
    process.exit(1);
  }
  const shell = fs.readFileSync(shellPath, 'utf8');
  const template = buildTemplate(shell);
  let count = 0;

  // The gallery listing needs the product catalogue, which is fetched further
  // down. Capture its meta here and rewrite that one file once we have it.
  let galleryBodyHtml = '';
  let galleryDeferred = null;

  // 1. Static routes (including home — overwrites the shell with uniform meta)
  for (const [p, meta] of Object.entries(STATIC_ROUTES)) {
    const graph = [
      ...baseGraph(),
      webPageSchema({ path: meta.path, name: meta.title, description: meta.description, type: SCHEMA_TYPE[p] || 'WebPage', image: meta.image }),
      breadcrumbSchema(BREADCRUMBS[p] || [{ name: 'Home', path: '/' }]),
    ];
    if (p === '/gallery') galleryDeferred = { p, meta, graph };
    writeRoute(p, renderRoute(template, meta, graph, ''));
    count++;
  }

  // 2. noindex shells for app-state routes (cart/checkout/order-*)
  for (const p of NOINDEX_ROUTES) {
    writeRoute(p, renderRoute(template, NOINDEX_META, [...baseGraph()]));
    count++;
  }

  // 3. Blog posts (local data)
  for (const post of blogPosts) {
    const meta = blogMeta(post);
    const cp = `/blog/${post.slug}`;
    const graph = [
      ...baseGraph(),
      webPageSchema({ path: cp, name: post.title, description: post.excerpt, type: 'BlogPosting', image: post.coverImage }),
      articleSchema({ post, path: cp }),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path: cp }]),
    ];
    writeRoute(cp, renderRoute(template, meta, graph, articleBody(post, cp)));
    count++;
  }

  // 4. Photo (product) pages — fetch product list + config + per-product variants
  let markupPct = 50;
  try {
    const cfg = await fetchJson(`${API_BASE}/catalog/config`);
    if (cfg && typeof cfg.markup_percentage === 'number') markupPct = cfg.markup_percentage;
  } catch (e) { console.warn('config fetch failed (using default 50% markup):', e.message); }

  // The API caps a page at 100 regardless of the limit asked for, so this must
  // paginate. It previously requested limit=200 in a single call and silently
  // took whatever came back — once the catalogue passed 100 photos that left
  // the remainder with no prerendered page, so they fell through to the SPA
  // shell and inherited the HOMEPAGE title and canonical.
  let products = [];
  try {
    const PAGE = 100;
    for (let offset = 0; ; offset += PAGE) {
      const data = await fetchJson(`${API_BASE}/products?limit=${PAGE}&offset=${offset}`);
      const batch = (data && data.products) || [];
      products = products.concat(batch);
      const total = Number(data && data.total);
      if (batch.length < PAGE) break;
      if (Number.isFinite(total) && products.length >= total) break;
      if (offset > 5000) break; // guard against a non-advancing endpoint
    }
  } catch (e) {
    console.error('ABORT: product list fetch failed — cannot prerender photo pages:', e.message);
    process.exit(1);
  }

  // A partial catalogue would ship canonical-collapsed pages, which is worse
  // than failing the build.
  try {
    const head = await fetchJson(`${API_BASE}/products?limit=1&offset=0`);
    const expected = Number(head && head.total);
    if (Number.isFinite(expected) && products.length < expected) {
      console.error(`ABORT: fetched ${products.length} products but the API reports ${expected}.`);
      process.exit(1);
    }
  } catch { /* non-fatal: the count check is a safety net, not a requirement */ }

  console.log(`prerender: ${products.length} products, ${markupPct}% markup`);

  if (galleryDeferred && products.length) {
    galleryBodyHtml = galleryBody(products);
    writeRoute(galleryDeferred.p, renderRoute(template, galleryDeferred.meta, galleryDeferred.graph, galleryBodyHtml));
    console.log(`prerender: gallery listing rewritten with ${products.length} products`);
  }

  await pool(products, 5, async (photo) => {
    if (!photo || !photo.slug) return;
    const cp = `/photo/${photo.slug}`;
    const meta = photoMeta(photo);
    // Fetch variant prices with graceful fallback (no prices → offers w/o low/high)
    let offerPrices = [];
    try {
      const v = await fetchJson(`${API_BASE}/catalog/variants/compatible/${photo.id}`);
      if (v && v.variants) {
        const basePrice = parseFloat(photo.base_price) || 0;
        offerPrices = Object.values(v.variants)
          .flatMap((m) => m?.sizes || [])
          .map((s) => (s?.wholesale || 0) * (1 + markupPct / 100) + basePrice)
          .filter((n) => Number.isFinite(n) && n > 0);
      }
    } catch (e) { /* leave offerPrices empty — productSchema handles it */ }
    const graph = [
      ...baseGraph(),
      webPageSchema({ path: cp, name: meta.title, description: meta.description, type: 'ItemPage', image: meta.image }),
      productSchema({ photo, offerPrices, canonicalPath: cp }),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }, { name: photo.title, path: cp }]),
    ];
    writeRoute(cp, renderRoute(template, meta, graph, photoBody(photo, offerPrices, cp)));
    count++;
  });

  console.log(`prerender: wrote ${count} static HTML files to ${outputDir}`);
}

main().catch((e) => { console.error('prerender fatal:', e); process.exit(1); });