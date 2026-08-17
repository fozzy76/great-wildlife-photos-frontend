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
const aboutMod = await import(toUrl(path.join(webRoot, 'src/data/aboutContent.js')));
const faqMod = await import(toUrl(path.join(webRoot, 'src/data/faqs.js')));
const collectionsMod = await import(toUrl(path.join(webRoot, 'src/data/collections.js')));
const COLLECTIONS = collectionsMod.COLLECTIONS || collectionsMod.default;
const policiesMod = await import(toUrl(path.join(webRoot, 'src/data/policies.js')));
const { shippingPolicy, returnsPolicy, licensePolicy } = policiesMod;

const {
  absoluteUrl, truncateText, baseGraph, webPageSchema, breadcrumbSchema,
  articleSchema, productSchema, imageObjectSchema, SITE_NAME, DEFAULT_SEO_IMAGE,
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
  '/shipping': [{ name: 'Home', path: '/' }, { name: 'Shipping', path: '/shipping' }],
  '/returns': [{ name: 'Home', path: '/' }, { name: 'Returns & Refunds', path: '/returns' }],
  '/license': [{ name: 'Home', path: '/' }, { name: 'Image Licensing', path: '/license' }],
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
// The prerendered body is the FIRST PAINT a visitor sees, before the ~813 kB
// bundle parses and React replaces it. Unstyled, it rendered as raw white text
// on the near-black theme background with no layout — which read as a glitch.
//
// So it is styled inline to match the site (Inter, the real theme colours, a
// centred column) and looks like a deliberate, simple version of the page
// while the app boots.
//
// It is styled, NOT hidden. Hiding content from visitors while serving it to
// crawlers is cloaking, which is a far worse problem than a brief flash.
const THEME = {
  bg: 'hsl(20 10% 5%)',
  fg: 'hsl(60 10% 98%)',
  muted: 'hsl(20 5% 74%)',
  primary: 'hsl(38 92% 50%)',
  border: 'hsl(20 5% 20%)',
};

function bodyBlock(html) {
  if (!html) return '';
  const css = [
    `font-family:Inter,system-ui,sans-serif`,
    `background:${THEME.bg}`,
    `color:${THEME.fg}`,
    `max-width:56rem`,
    `margin:0 auto`,
    `padding:6rem 1.5rem 4rem`,
    `line-height:1.7`,
    `font-size:1rem`,
  ].join(';');
  // Scoped element styles so headings, images and links are not left at
  // browser defaults inside the injected block.
  const scoped = `
    #prerender-content h1{font-size:2rem;line-height:1.2;margin:0 0 1rem;font-weight:700}
    #prerender-content h2{font-size:1.35rem;line-height:1.3;margin:2rem 0 .75rem;font-weight:700}
    #prerender-content h3{font-size:1.1rem;margin:1.5rem 0 .5rem;font-weight:600}
    #prerender-content p{margin:0 0 1rem;color:${THEME.muted}}
    #prerender-content a{color:${THEME.primary};text-decoration:none}
    #prerender-content img{max-width:100%;height:auto;border-radius:.75rem;margin:1rem 0}
    #prerender-content ul{margin:0 0 1rem;padding-left:1.25rem;color:${THEME.muted}}
    #prerender-content li{margin:.25rem 0}
    #prerender-content nav{font-size:.875rem;color:${THEME.muted};margin-bottom:1.5rem}
    #prerender-content dt{font-weight:600;margin-top:.75rem}
    #prerender-content dd{margin:0;color:${THEME.muted}}
    #prerender-content figcaption{font-size:.875rem;color:${THEME.muted};font-style:italic}
  `.replace(/\s+/g, ' ').trim();
  // The site's nav and footer are React-rendered, so NO internal links exist in
  // the raw HTML. Anything that does not execute JavaScript can only follow
  // links that appear here — which left /contact/ an orphan, reachable from
  // nothing. This minimal nav guarantees every main section is crawlable.
  const nav = `<nav aria-label="Site" style="border-top:1px solid ${THEME.border};margin-top:2.5rem;padding-top:1.25rem;font-size:.875rem">
    <a href="/">Home</a> &middot;
    <a href="/gallery/">Gallery</a> &middot;
    <a href="/about/">About Lynn Starnes</a> &middot;
    <a href="/blog/">Field Notes</a> &middot;
    <a href="/faq/">FAQ</a> &middot;
    <a href="/contact/">Contact</a>
  </nav>`;
  return `<div id="prerender-content" style="${css}"><style>${scoped}</style>${html.trim()}${nav}</div>`;
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
      ${cats.length ? `<h2>Collections</h2>\n      <ul>\n        ${cats.map((c) => {
        // Link to the collection landing page where one exists, so /gallery/ is a
        // hub rather than a dead end. Bare text was leaving every category name
        // unlinked and the whole catalogue hanging off this one page.
        const col = COLLECTIONS.find((x) => x.category === c);
        return col ? `<li><a href="/gallery/${esc(col.slug)}/">${esc(col.name)}</a></li>` : `<li>${esc(c)}</li>`;
      }).join('\n        ')}\n      </ul>` : ''}
      <h2>All photographs</h2>
      <ul>
        ${items}
      </ul>
    </main>
  `);
}

// Collection landing page body. Every photograph in the collection is linked, so a
// non-JS crawler reaches the whole catalogue through nine topical hubs instead of
// one flat /gallery/ page — which is the reason these pages exist.
function collectionBody(collection, items) {
  const links = items.map((p) =>
    `<li><a href="/photo/${esc(p.slug)}/">${esc(p.title)}</a></li>`
  ).join('\n        ');
  const others = COLLECTIONS.filter((c) => c.slug !== collection.slug)
    .map((c) => `<li><a href="/gallery/${esc(c.slug)}/">${esc(c.name)}</a></li>`).join('\n        ');
  return bodyBlock(`
    <main>
      <h1>${esc(collection.name)} Photography Prints</h1>
      <p>${esc(collection.intro)}</p>
      <p>${items.length} photograph${items.length === 1 ? '' : 's'} in this collection, available as
      canvas, acrylic and aluminium prints.</p>
      <h2>Photographs in this collection</h2>
      <ul>
        ${links}
      </ul>
      <h2>Other collections</h2>
      <ul>
        ${others}
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

function aboutBodyHtml() {
  const { aboutHero, aboutHeading, aboutBody, aboutCredentials, aboutPortrait } = aboutMod;
  return bodyBlock(`
    <main>
      <h1>${esc(aboutHero.heading)}</h1>
      <p>${esc(aboutHero.standfirst)}</p>
      <figure>
        <img src="${esc(aboutPortrait.jpg)}" alt="${esc(aboutPortrait.alt)}" width="${aboutPortrait.width}" height="${aboutPortrait.height}" />
        <figcaption>${esc(aboutPortrait.caption)}</figcaption>
      </figure>
      <h2>${esc(aboutHeading)}</h2>
      ${aboutBody.map((b) => `<p>${b.type === 'quote' ? '&ldquo;' + esc(b.text) + '&rdquo;' : esc(b.text)}</p>`).join(' ')}
      <h2>Credentials</h2>
      <dl>
        ${aboutCredentials.map((c) => `<dt>${esc(c.label)}</dt><dd>${c.lines.map(esc).join(' — ')}</dd>`).join(' ')}
      </dl>
    </main>
  `);
}

function faqBodyHtml() {
  const { faqSections } = faqMod;
  return bodyBlock(`
    <main>
      <h1>Frequently Asked Questions</h1>
      ${faqSections.map((sec) => `
      <section>
        <h2>${esc(sec.title)}</h2>
        ${sec.items.map((it) => `<h3>${esc(it.question)}</h3>
        <p>${esc(it.answer)}</p>`).join(' ')}
      </section>`).join(' ')}
    </main>
  `);
}

function blogIndexBodyHtml() {
  return bodyBlock(`
    <main>
      <h1>Field Notes &amp; Print Guides</h1>
      <p>Writing on wildlife photography, print materials and the animals Lynn photographs.</p>
      <ul>
        ${blogPosts.map((post) => `<li><a href="/blog/${esc(post.slug)}/">${esc(post.title)}</a>${post.excerpt ? ` &mdash; ${esc(String(post.excerpt).slice(0, 160))}` : ''}</li>`).join(' ')}
      </ul>
    </main>
  `);
}

function homeBodyHtml(products = []) {
  const m = STATIC_ROUTES['/'] || {};
  const featured = products.slice(0, 24);
  const SEP = '\n        ';
  const collectionLinks = COLLECTIONS
    .map((c) => `<li><a href="/gallery/${esc(c.slug)}/">${esc(c.name)} prints</a></li>`)
    .join(SEP);
  const featuredLinks = featured
    .map((p) => `<li><a href="/photo/${esc(p.slug)}/">${esc(p.title)}</a>${p.category ? ` &mdash; ${esc(p.category)}` : ''}</li>`)
    .join(SEP);
  const featuredBlock = featured.length
    ? `<h2>Featured photographs</h2>${SEP}<ul>${SEP}${featuredLinks}${SEP}</ul>`
    : '';
  return bodyBlock(`
    <main>
      <h1>${esc(m.title || 'Great Wildlife Photos')}</h1>
      <p>${esc(m.description || '')}</p>
      <p>Award-winning North American wildlife and landscape photography by Lynn Starnes,
      available as museum-quality canvas, acrylic and aluminium prints. Lynn spent thirty-eight
      years as a fish and wildlife biologist before turning her field knowledge into photographs
      &mdash; including a polar bear image judged in the top 25 of almost 70,000 entries for
      Nature's Best / Smithsonian in 2018.</p>
      <h2>Collections</h2>
      <ul>
        ${collectionLinks}
      </ul>
      ${featuredBlock}
      <h2>More</h2>
      <ul>
        <li><a href="/gallery/">Browse every wildlife print</a></li>
        <li><a href="/about/">About Lynn Starnes</a></li>
        <li><a href="/faq/">Print materials, sizes and shipping</a></li>
        <li><a href="/blog/">Field notes and print guides</a></li>
        <li><a href="/shipping/">Shipping</a></li>
        <li><a href="/returns/">Returns &amp; refunds</a></li>
        <li><a href="/license/">Image licensing</a></li>
      </ul>
    </main>
  `);
}

function contactBodyHtml() {
  const m = STATIC_ROUTES['/contact'] || {};
  return bodyBlock(`
    <main>
      <h1>${esc(m.title || 'Contact')}</h1>
      <p>${esc(m.description || '')}</p>
      <h2>Send us a message</h2>
      <p>Questions about a print, a size that is not listed, or an order already placed &mdash;
      use the contact form and Lynn will reply directly.</p>
      <h2>Custom photo requests</h2>
      <p>If you have seen an image in one of the collections and need a size or material that is not
      shown on the product page, ask &mdash; not every combination is listed.</p>
      <h2>International orders</h2>
      <p>International orders are handled by Lynn directly rather than through the online checkout.
      Get in touch before ordering.</p>
    </main>
  `);
}

// Shipping / Returns bodies, from the same module the React pages render from.
function policyBody(policy) {
  const secs = policy.sections
    .map((sec) => {
      const paras = sec.body.map((b) => `<p>${esc(b)}</p>`).join('\n      ');
      return `<h2>${esc(sec.heading)}</h2>\n      ${paras}`;
    })
    .join('\n      ');
  return bodyBlock(`
    <main>
      <h1>${esc(policy.heading)}</h1>
      <p>${esc(policy.intro)}</p>
      ${secs}
    </main>
  `);
}

const STATIC_BODY = {
  '/about': aboutBodyHtml,
  '/faq': faqBodyHtml,
  '/blog': blogIndexBodyHtml,
  '/contact': contactBodyHtml,
  '/shipping': () => policyBody(shippingPolicy),
  '/returns': () => policyBody(returnsPolicy),
  '/license': () => policyBody(licensePolicy),
};

function renderRoute(template, meta, schemaGraph, body) {
  let out = template.replace('<!--PRERENDER-INJECT-->', '    ' + headBlock(meta, schemaGraph));
  if (body) {
    out = out.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  }
  return out;
}

// Build-time reads MUST be fresh. A build that fetches a cached product list
// bakes stale titles and descriptions into static HTML that then sits there
// until the next deploy — observed after retitling two photographs: the API
// returned the new titles while the prerendered pages still showed the old
// ones. Bust the cache explicitly rather than trusting upstream headers.
async function fetchJson(url) {
  const bust = `_pr=${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  const fresh = url + (url.includes('?') ? '&' : '?') + bust;
  const r = await fetch(fresh, {
    headers: { 'user-agent': 'GWP-prerender/1.0', 'cache-control': 'no-cache', pragma: 'no-cache' },
    cache: 'no-store',
  });
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
  let homeDeferred = null;
  let galleryDeferred = null;

  // 1. Static routes (including home — overwrites the shell with uniform meta)
  for (const [p, meta] of Object.entries(STATIC_ROUTES)) {
    const graph = [
      ...baseGraph(),
      webPageSchema({ path: meta.path, name: meta.title, description: meta.description, type: SCHEMA_TYPE[p] || 'WebPage', image: meta.image }),
      breadcrumbSchema(BREADCRUMBS[p] || [{ name: 'Home', path: '/' }]),
    ];
    if (p === '/gallery') galleryDeferred = { p, meta, graph };
    if (p === '/') homeDeferred = { p, meta, graph };
    const staticBody = STATIC_BODY[p] ? STATIC_BODY[p]() : '';
    writeRoute(p, renderRoute(template, meta, graph, staticBody));
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

  // Publish the blog index as JSON so the backend sitemap can read it.
  // Blog posts live in this repo but the sitemap is served by the API, which
  // previously carried a HARDCODED list of slugs — so any new article was
  // silently missing from the sitemap.
  try {
    fs.writeFileSync(
      path.join(outputDir, 'blog-index.json'),
      JSON.stringify(blogPosts.map((b) => ({ slug: b.slug, date: b.date })), null, 1)
    );
    console.log(`prerender: wrote blog-index.json (${blogPosts.length} posts)`);
  } catch (e) { console.warn('blog-index.json write failed:', e.message); }

  // 4b. Collection landing pages — one real URL per catalogue category.
  //
  // Before these existed the only per-collection URLs were query strings
  // (/gallery?category=Bears), which canonicalise to /gallery and therefore cannot
  // rank, and every product page hung off /gallery alone. Products are grouped from
  // the list already fetched above — no extra API calls, and the counts cannot
  // disagree with what the pages actually link to.
  const collectionCounts = [];
  for (const collection of COLLECTIONS) {
    const items = products.filter((p) => p && p.category === collection.category);
    if (!items.length) {
      // A collection with no photographs would be a thin page inviting a crawler in
      // for nothing. Skip it rather than publish it.
      console.warn(`prerender: collection "${collection.category}" has 0 products — page skipped`);
      continue;
    }
    const cp = `/gallery/${collection.slug}`;
    const meta = {
      title: collection.title,
      description: collection.description,
      path: cp,
      image: DEFAULT_SEO_IMAGE,
      type: 'website',
      // headBlock always writes a robots tag, so omitting this shipped
      // content="" on all nine pages. Caught by checking the built HTML.
      robots: 'index,follow',
    };
    const graph = [
      ...baseGraph(),
      webPageSchema({ path: cp, name: collection.title, description: collection.description, type: 'CollectionPage', image: DEFAULT_SEO_IMAGE }),
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Gallery', path: '/gallery' },
        { name: collection.name, path: cp },
      ]),
    ];
    writeRoute(cp, renderRoute(template, meta, graph, collectionBody(collection, items)));
    collectionCounts.push({ slug: collection.slug, category: collection.category, count: items.length });
    count++;
  }
  console.log(`prerender: wrote ${collectionCounts.length} collection pages (${collectionCounts.map((c) => `${c.slug}:${c.count}`).join(', ')})`);

  // Publish the collection index so the backend sitemap can list these URLs, the
  // same mechanism used for blog posts — the sitemap lives in the API repo and must
  // not carry a hardcoded list that silently goes stale.
  try {
    fs.writeFileSync(
      path.join(outputDir, 'collections-index.json'),
      JSON.stringify(collectionCounts.map((c) => ({ slug: c.slug, count: c.count })), null, 1)
    );
    console.log(`prerender: wrote collections-index.json (${collectionCounts.length} collections)`);
  } catch (e) { console.warn('collections-index.json write failed:', e.message); }

  // The homepage body links the nine collections and the first 24 photographs, so it
  // is rewritten here once products are available — it previously linked no images at
  // all and carried ~118 crawlable words.
  if (homeDeferred) {
    writeRoute('/', renderRoute(template, homeDeferred.meta, homeDeferred.graph, homeBodyHtml(products)));
    console.log(`prerender: home rewritten with ${COLLECTIONS.length} collections + ${Math.min(products.length,24)} featured photos`);
  }

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
      // Licensable-image metadata — see seo.js. Returns null if the photo has no
      // image URL; baseGraph consumers filter falsy nodes.
      imageObjectSchema({ photo, canonicalPath: cp }),
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }, { name: photo.title, path: cp }]),
    ];
    writeRoute(cp, renderRoute(template, meta, graph, photoBody(photo, offerPrices, cp)));
    count++;
  });

  console.log(`prerender: wrote ${count} static HTML files to ${outputDir}`);
}

main().catch((e) => { console.error('prerender fatal:', e); process.exit(1); });