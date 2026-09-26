export const SITE_URL = 'https://greatwildlifephotos.com';
export const SITE_NAME = 'Great Wildlife Photos';
export const DEFAULT_SEO_IMAGE = 'https://images.greatwildlifephotos.com/photos/fb-2026-bobcat-in-snow-lbs9571-copy-1781792895936.jpg';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

// Canonical URLs must carry a trailing slash.
//
// The build writes every route as dist/apps/web/<route>/index.html — a
// directory — so Apache/LiteSpeed DirectorySlash 301s /about to /about/. The
// trailing-slash form is therefore the URL the server actually serves.
//
// This previously returned the no-slash form, so canonical, og:url, twitter:url
// and every schema @id/url named a URL that redirects. Google reported the
// affected pages as "Page with redirect" instead of indexing them, and split
// each page's ranking across both forms (/about pos 6.6 vs /about/ pos 2.6).
//
// Query strings keep their place after the slash: /gallery?x -> /gallery/?x
export const absoluteUrl = (path = '/') => {
  if (!path) return SITE_URL + '/';
  if (/^https?:\/\//i.test(path)) return path;

  const withLeading = path.startsWith('/') ? path : `/${path}`;
  const hashAt = withLeading.indexOf('#');
  const hash = hashAt === -1 ? '' : withLeading.slice(hashAt);
  const noHash = hashAt === -1 ? withLeading : withLeading.slice(0, hashAt);
  const queryAt = noHash.indexOf('?');
  const query = queryAt === -1 ? '' : noHash.slice(queryAt);
  const pathname = queryAt === -1 ? noHash : noHash.slice(0, queryAt);

  return SITE_URL + (pathname.endsWith('/') ? pathname : `${pathname}/`) + query + hash;
};

export const truncateText = (value = '', maxLength = 155) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
};

// Returns and shipping are declared ONCE here, at Organization level, because that is what
// Google asks for: "A standard return policy for your business that applies to most or all
// products you sell can be specified using the MerchantReturnPolicy structured data type
// nested under the Organization structured data type", and for shipping, "Include the
// ShippingService structured data type under the Organization structured data type."
//
// 🔴 EVERY VALUE BELOW COMES FROM src/data/policies.js — the same source the Shipping and
// Returns pages and the prerender read. Nothing here is estimated. If a policy changes,
// change it there and mirror it here.
//
// ⚠ NO shippingRate is claimed, deliberately. Shipping is charged per size and the live
// catalog carries SEVEN distinct rates ($5.90 to $29.90 across 41 variants), so any single
// figure here would be false. Google does not require it ("If applicable"), and its own
// guidance is to configure delivery settings in Merchant Center where markup cannot stay
// accurate. Destination and delivery time ARE stated, because those are published facts.
//
// ⚠ The 4-day and 8-day figures cover printing AND transit together — that is how the
// Shipping page states them. No separate handlingTime is claimed, because the source does
// not separate the two.
const returnPolicySchema = () => ({
  '@type': 'MerchantReturnPolicy',
  '@id': `${SITE_URL}/returns/#returnpolicy`,
  applicableCountry: ['US', 'CA'],
  // Made to order, so change-of-mind returns are not accepted. This is the honest category:
  // a finite window would imply general returns the policy does not offer.
  returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
  merchantReturnLink: `${SITE_URL}/returns/`,
  // Damaged, defective or incorrect orders are replaced free and nothing goes back in the post.
  itemDefectReturnFees: 'https://schema.org/FreeReturn',
  // Replacement normally; a full refund where replacement is not possible.
  refundType: ['https://schema.org/ExchangeRefund', 'https://schema.org/FullRefund']
});

const BUSINESS_DAYS = [
  'https://schema.org/Monday',
  'https://schema.org/Tuesday',
  'https://schema.org/Wednesday',
  'https://schema.org/Thursday',
  'https://schema.org/Friday'
];

const shippingServiceSchema = () => ({
  '@type': 'ShippingService',
  name: 'Made-to-order print delivery',
  description: 'Prints are produced after the order is placed and shipped by UPS, FedEx or DHL.',
  shippingConditions: [
    {
      '@type': 'ShippingConditions',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
      transitTime: {
        '@type': 'ServicePeriod',
        duration: { '@type': 'QuantitativeValue', maxValue: 4, unitCode: 'DAY' },
        businessDays: BUSINESS_DAYS
      }
    },
    {
      '@type': 'ShippingConditions',
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'CA' },
      transitTime: {
        '@type': 'ServicePeriod',
        duration: { '@type': 'QuantitativeValue', maxValue: 8, unitCode: 'DAY' },
        businessDays: BUSINESS_DAYS
      }
    }
  ]
});

export const organizationSchema = () => ({
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: 'https://images.greatwildlifephotos.com/branding/gwp-logo.png',
  email: 'lynn@greatwildlifephotos.com',
  founder: {
    '@type': 'Person',
    name: 'Lynn Starnes'
  },
  hasMerchantReturnPolicy: returnPolicySchema(),
  hasShippingService: shippingServiceSchema()
});

export const websiteSchema = () => ({
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  publisher: {
    '@id': ORGANIZATION_ID
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/gallery?q={search_term_string}`,
    'query-input': 'required name=search_term_string'
  }
});

export const webPageSchema = ({ path = '/', name, description, type = 'WebPage', image = DEFAULT_SEO_IMAGE }) => ({
  '@type': type,
  '@id': `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name,
  description,
  image,
  isPartOf: {
    '@id': WEBSITE_ID
  },
  publisher: {
    '@id': ORGANIZATION_ID
  }
});

export const breadcrumbSchema = (items = []) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path)
  }))
});

export const articleSchema = ({ post, path }) => ({
  '@type': 'Article',
  '@id': `${absoluteUrl(path)}#article`,
  headline: post.title,
  description: post.excerpt,
  image: post.coverImage,
  datePublished: post.date,
  dateModified: post.date,
  author: {
    '@type': 'Person',
    name: 'Lynn Starnes'
  },
  publisher: {
    '@id': ORGANIZATION_ID
  },
  mainEntityOfPage: {
    '@id': `${absoluteUrl(path)}#webpage`
  }
});

export const faqSchema = (sections = []) => ({
  '@type': 'FAQPage',
  mainEntity: sections.flatMap(section => section.items).map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }))
});

// Image licence metadata — this is what makes a photograph eligible for the
// "Licensable" badge in Google Images, with a link through to where a licence can
// be obtained. It is the single most relevant Google feature for a photographer
// selling their own work, and the site published none of it: measured 2026-08-17,
// Google Images gave 460 impressions, 0 clicks, average position 80.
//
// Google's image-licence structured data requires an ImageObject carrying
// contentUrl plus `license` (a page describing the licence) and/or
// `acquireLicensePage` (a page telling the user how to obtain one). creator,
// creditText and copyrightNotice are supported alongside and are all true here.
//
// The terms these point at are Lynn's own, from the FAQ: buying a print grants
// display rights only, and editorial/press/commercial licences are considered
// individually on request — so the badge is honest, not decorative.
export const LICENSE_PATH = '/license';

export const imageObjectSchema = ({ photo, canonicalPath }) => {
  const imageUrl = photo?.r2_url || photo?.photo_url;
  if (!imageUrl) return null;
  return {
    '@type': 'ImageObject',
    '@id': `${absoluteUrl(canonicalPath)}#image`,
    contentUrl: imageUrl,
    url: imageUrl,
    name: photo?.title,
    description: truncateText(photo?.description || `${photo?.title} — wildlife photograph by Lynn Starnes.`, 500),
    license: absoluteUrl(LICENSE_PATH),
    acquireLicensePage: absoluteUrl(LICENSE_PATH),
    creditText: 'Lynn Starnes',
    creator: { '@type': 'Person', name: 'Lynn Starnes' },
    copyrightNotice: '© Lynn Starnes',
    creditedTo: { '@type': 'Person', name: 'Lynn Starnes' },
  };
};

/*
 * MERCHANT LISTINGS REQUIRE AN `Offer`, NOT AN `AggregateOffer`.
 * Google, developers.google.com/search/docs/appearance/structured-data/merchant-listing:
 * "Product snippets accept an `Offer` or `AggregateOffer` but merchant listings require
 * an `Offer`" — the seller has to be identifiable. Every photo page emitted only an
 * AggregateOffer until 2026-09-25, so 161 product pages could never be merchant
 * listings, on a store whose whole purpose is selling those prints.
 *
 * `offerList` carries one entry per purchasable material/size, so each becomes its own
 * Offer at a price that URL genuinely sells at. Passing nothing keeps the old
 * AggregateOffer, so a caller that has no variant detail does not regress.
 *
 * The return policy is `MerchantReturnNotPermitted` because that is the store's actual,
 * published policy — prints are made to order (see data/policies.js, "we are not able to
 * accept returns for change of mind"). Damaged or incorrect orders are replaced, which is
 * not a return in schema.org terms. Never soften this to look better in a rich result.
 * shippingDetails is deliberately OMITTED: there are 7 live rates from $5.90 to $29.90 and
 * no single figure is true, and a recommended property left out costs nothing while a wrong
 * one is a misrepresentation.
 */
const offerFor = ({ price, material, variantId, sku, canonicalPath }) => {
  const params = material && variantId ? `?material=${encodeURIComponent(material)}&variant=${encodeURIComponent(variantId)}` : '';
  const offer = {
    '@type': 'Offer',
    priceCurrency: 'USD',
    price: Number(price).toFixed(2),
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    url: absoluteUrl(canonicalPath) + params,
    seller: { '@id': ORGANIZATION_ID },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: ['US', 'CA'],
      returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
    },
  };
  if (sku) offer.sku = sku;
  return offer;
};

export const productSchema = ({ photo, offerPrices = [], offerList = [], canonicalPath }) => {
  const imageUrl = photo?.r2_url || photo?.photo_url || DEFAULT_SEO_IMAGE;
  const prices = offerPrices
    .map(price => Number(price))
    .filter(price => Number.isFinite(price) && price > 0);
  const lowPrice = prices.length ? Math.min(...prices).toFixed(2) : undefined;
  const highPrice = prices.length ? Math.max(...prices).toFixed(2) : undefined;

  const schema = {
    '@type': 'Product',
    '@id': `${absoluteUrl(canonicalPath)}#product`,
    name: photo?.title,
    description: truncateText(photo?.description || `Premium ${photo?.category || 'wildlife'} photography print by Lynn Starnes.`, 500),
    image: [imageUrl],
    brand: {
      '@type': 'Brand',
      name: SITE_NAME
    },
    manufacturer: {
      '@id': ORGANIZATION_ID
    },
    category: photo?.category,
    material: ['Canvas', 'Metal', 'Acrylic'],
    url: absoluteUrl(canonicalPath),
  };

  // sku mirrors the Merchant Center feed's item_group_id (gwp-photo-<id>) so the page
  // markup and the feed identify the same thing rather than two unrelated ids.
  if (photo?.id) schema.sku = `gwp-photo-${photo.id}`;

  const validOffers = (offerList || [])
    .filter((o) => o && Number.isFinite(Number(o.price)) && Number(o.price) > 0)
    .map((o) => offerFor({ ...o, canonicalPath }));

  if (validOffers.length) {
    schema.offers = validOffers;
  } else {
    schema.offers = {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@id': ORGANIZATION_ID
      }
    };
    if (lowPrice) schema.offers.lowPrice = lowPrice;
    if (highPrice) schema.offers.highPrice = highPrice;
    if (prices.length) schema.offers.offerCount = String(prices.length);
  }

  return schema;
};

export const baseGraph = () => [organizationSchema(), websiteSchema()];
