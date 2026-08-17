// Single source of truth for per-route SEO meta (the route-VARYING tags that the
// prerender step bakes into each static HTML file). The page <SEO> components
// consume these same values so the prerendered raw HTML and the hydrated DOM
// can't drift on title/description/canonical/robots — the tags that decide
// Google's canonical-collapse behavior.
//
// Page-specific rich schemas (FAQ/Article/Product JSON-LD) stay inline in each
// page and are delivered via Helmet hydration; the prerender emits a uniform
// baseGraph + webPageSchema + breadcrumb graph per route, which Googlebot's
// JS render pass replaces/augments with the full page schema.
//
// DO NOT edit a page's title/description/robots here without also updating the
// matching page <SEO> spread — they share this module so one change covers both.

import { DEFAULT_SEO_IMAGE, truncateText } from './seo.js';

const INDEX = 'index,follow';
const NOINDEX = 'noindex,follow';

export const STATIC_ROUTES = {
  '/': {
    title: 'Great Wildlife Photos - Premium Wildlife Photography Prints',
    description:
      'Discover award-winning North American wildlife photography prints by Lynn Starnes. Shop premium canvas, metal, and acrylic prints captured in the wild.',
    path: '/',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: INDEX,
  },
  // Gallery default (no query params). The gallery PAGE computes query-dependent
  // title/description/robots at runtime (filter/search/pagination variants get
  // noindex,follow); this entry is the no-query baseline the prerender bakes in.
  '/gallery': {
    title: 'Wildlife Photography Prints Gallery | Great Wildlife Photos',
    description:
      'Browse award-winning North American wildlife photography prints by Lynn Starnes. Filter fine art prints by subject and shop canvas, metal, and acrylic options.',
    path: '/gallery',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: INDEX,
  },
  '/about': {
    title: 'About Lynn Starnes | Great Wildlife Photos',
    description:
      'Learn about Lynn Starnes, award-winning North American wildlife photographer recognized by Nature’s Best Photography and the Smithsonian Institution.',
    path: '/about',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: INDEX,
  },
  '/faq': {
    title: 'Wildlife Print FAQ | Great Wildlife Photos',
    description:
      'Answers about Great Wildlife Photos print materials, ordering, shipping, returns, copyright, and Lynn Starnes’ wildlife photography.',
    path: '/faq',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: INDEX,
  },
  '/shipping': {
    title: 'Shipping | Great Wildlife Photos',
    description:
      'How Great Wildlife Photos prints are made and delivered — printed to order in the USA, typically delivered in 4 business days, shipped by UPS, FedEx or DHL.',
    path: '/shipping',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: INDEX,
  },
  '/license': {
    title: 'Image Licensing & Copyright | Great Wildlife Photos',
    description:
      "Copyright and image licensing for Lynn Starnes wildlife photography. Prints are sold for display; editorial, press and commercial licences are considered individually.",
    path: '/license',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: INDEX,
  },
  '/returns': {
    title: 'Returns & Refunds | Great Wildlife Photos',
    description:
      'Returns and refunds at Great Wildlife Photos. Prints are made to order, so we do not accept change-of-mind returns — but damaged, defective or incorrect orders are replaced free of charge.',
    path: '/returns',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: INDEX,
  },
  '/contact': {
    title: 'Contact Lynn Starnes | Great Wildlife Photos',
    description:
      'Contact Lynn Starnes about wildlife photography prints, custom requests, international orders, licensing, or questions about Great Wildlife Photos.',
    path: '/contact',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: INDEX,
  },
  '/blog': {
    title: 'From the Field - Wildlife Photography Blog | Great Wildlife Photos',
    description:
      'Stories, print buying guides, and field notes from award-winning wildlife photographer Lynn Starnes.',
    path: '/blog',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: INDEX,
  },
  '/privacy': {
    title: 'Privacy Policy | Great Wildlife Photos',
    description:
      'Privacy policy for Great Wildlife Photos and Lynn Starnes wildlife photography print orders.',
    path: '/privacy',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: NOINDEX,
  },
  '/terms': {
    title: 'Terms of Service | Great Wildlife Photos',
    description:
      'Terms of service and purchase conditions for Great Wildlife Photos fine art wildlife prints.',
    path: '/terms',
    image: DEFAULT_SEO_IMAGE,
    type: 'website',
    robots: NOINDEX,
  },
};

// Blog post meta — sourced from src/data/blogPosts.js (local, build-time available).
export const blogMeta = (post) => ({
  title: `${post.title} | Great Wildlife Photos Blog`,
  description: post.excerpt,
  path: `/blog/${post.slug}`,
  image: post.coverImage || DEFAULT_SEO_IMAGE,
  type: 'article',
  robots: INDEX,
});

// Photo (product) meta — title/description/image/canonical. Price aggregation
// (offerPrices) is handled by the prerender via seo.js productSchema so this
// stays a pure function of the product record.
export const photoMeta = (photo) => ({
  title: `${photo.title} - Great Wildlife Photos`,
  description: truncateText(
    photo.description ||
      `Premium ${photo.category || 'wildlife'} wildlife photography print by Lynn Starnes, available on canvas, metal, and acrylic.`,
    155
  ),
  path: `/photo/${photo.slug}`,
  image: photo.r2_url || photo.photo_url || DEFAULT_SEO_IMAGE,
  type: 'product',
  robots: INDEX,
});

// App-state routes that should never be indexed. No unique canonical needed —
// just noindex. The prerender writes a noindex shell for each of these.
export const NOINDEX_ROUTES = ['/cart', '/checkout', '/order-success', '/order-receipt'];

export const NOINDEX_META = {
  title: 'Great Wildlife Photos',
  description:
    'Award-winning North American wildlife photography prints by Lynn Starnes. Fine art prints on canvas, metal, and acrylic.',
  path: '/',
  image: DEFAULT_SEO_IMAGE,
  type: 'website',
  robots: NOINDEX,
};