import React from 'react';
import { Helmet } from 'react-helmet';
import { DEFAULT_SEO_IMAGE, SITE_NAME, absoluteUrl, truncateText } from '@/lib/seo.js';

const SEO = ({
  title,
  description,
  path = '/',
  image = DEFAULT_SEO_IMAGE,
  type = 'website',
  robots = 'index,follow',
  schema = [],
  children
}) => {
  const canonicalUrl = absoluteUrl(path);
  const cleanDescription = truncateText(description);
  const schemaGraph = Array.isArray(schema) ? schema.filter(Boolean) : [schema].filter(Boolean);

  // The prerender writes a canonical into the static shell, and react-helmet then adds
  // its own on hydration, so every rendered page carried TWO canonical link elements
  // (measured 2026-09-25: 2 of 2 on 20 of 20 pages sampled, verified by attribute —
  // the static one has no data-react-helmet, helmet's has data-react-helmet="true").
  // Both hold the same URL so nothing is contradicted, but a page should declare it
  // once, and Google's canonicalization guide asks that JavaScript not interfere with
  // the canonical element.
  //
  // 🔴 A single useEffect pass is NOT enough and looked like it worked: the effect runs
  // BEFORE helmet inserts its tag, so it found no helmet copy and removed nothing. It
  // only appeared to work on product pages, where the photo loading re-runs the effect
  // after helmet has committed. Measured on /about/ and /gallery/: still 2. So wait for
  // helmet's tag, bounded, then remove the static one — never remove the only canonical
  // on the page.
  React.useEffect(() => {
    let tries = 0;
    let timer = null;
    const sweep = () => {
      const helmetOwned = document.querySelector('link[rel="canonical"][data-react-helmet]');
      const stale = document.querySelectorAll('link[rel="canonical"]:not([data-react-helmet])');
      if (helmetOwned && stale.length) {
        stale.forEach((el) => el.remove());
        return;
      }
      if (tries++ < 40) timer = window.setTimeout(sweep, 50);
    };
    sweep();
    return () => { if (timer) window.clearTimeout(timer); };
  }, [canonicalUrl]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={cleanDescription} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:url" content={canonicalUrl} />

      {schemaGraph.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': schemaGraph
          })}
        </script>
      )}

      {children}
    </Helmet>
  );
};

export default SEO;
