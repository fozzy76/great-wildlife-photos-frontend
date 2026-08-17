import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import SEO from '@/components/SEO.jsx';
import { DEFAULT_SEO_IMAGE, baseGraph, breadcrumbSchema, webPageSchema } from '@/lib/seo.js';
import { COLLECTION_BY_SLUG } from '@/data/collections.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.greatwildlifephotos.com';

// One landing page per catalogue collection.
//
// Why these exist: every photograph was reachable only from /gallery/, so all 161
// product pages hung off a single hub at crawl depth 2 with no topical grouping,
// and the only per-collection URLs were query strings (/gallery?category=Bears)
// which canonicalise away and cannot rank. These pages give each collection a real
// indexable URL, Lynn's own words about the subject, and a direct link to every
// photograph in it.
//
// Copy comes from src/data/collections.js, which the prerender imports too, so the
// static HTML and the React render cannot drift apart.
export default function CollectionPage() {
  const { collectionSlug } = useParams();
  const collection = COLLECTION_BY_SLUG[collectionSlug];

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collection) return;
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/products?limit=100&category=${encodeURIComponent(collection.category)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setPhotos((d && d.products) || []); })
      .catch(() => { if (!cancelled) setPhotos([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [collection]);

  // An unknown slug is a genuine 404, not a silent homepage — the SPA catch-all
  // returning 200 for URLs that do not exist has already produced one false
  // positive during verification on this site.
  if (!collection) return <Navigate to="/gallery" replace />;

  const path = `/gallery/${collection.slug}`;

  return (
    <div className="w-full">
      <SEO
        title={collection.title}
        description={collection.description}
        path={path}
        image={DEFAULT_SEO_IMAGE}
        schema={[
          ...baseGraph(),
          webPageSchema({
            path,
            name: collection.title,
            description: collection.description,
            type: 'CollectionPage',
            image: DEFAULT_SEO_IMAGE,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Gallery', path: '/gallery' },
            { name: collection.name, path },
          ]),
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/gallery" className="hover:underline">Gallery</Link>
          <span className="mx-2">/</span>
          <span>{collection.name}</span>
        </nav>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {collection.name} Photography Prints
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {collection.intro}
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          {loading ? 'Loading photographs…' : `${photos.length} photograph${photos.length === 1 ? '' : 's'} in this collection.`}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <Link
              key={p.id || p.slug}
              to={`/photo/${p.slug}/`}
              className="group overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary"
            >
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={`${p.title} — wildlife photography print by Lynn Starnes`}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
                />
              )}
              <div className="p-3">
                <h2 className="text-sm font-medium">{p.title}</h2>
              </div>
            </Link>
          ))}
        </div>

        {!loading && photos.length === 0 && (
          <p className="mt-8 text-muted-foreground">
            No photographs are listed in this collection yet.{' '}
            <Link to="/gallery" className="text-primary hover:underline">Browse the full gallery</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
