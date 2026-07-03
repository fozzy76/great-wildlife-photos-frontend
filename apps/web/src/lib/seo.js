export const SITE_URL = 'https://greatwildlifephotos.com';
export const SITE_NAME = 'Great Wildlife Photos';
export const DEFAULT_SEO_IMAGE = 'https://images.greatwildlifephotos.com/photos/fb-2026-bobcat-in-snow-lbs9571-copy-1781792895936.jpg';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const absoluteUrl = (path = '/') => {
  if (!path) return SITE_URL + '/';
  if (/^https?:\/\//i.test(path)) return path;
  return SITE_URL + (path.startsWith('/') ? path : `/${path}`);
};

export const truncateText = (value = '', maxLength = 155) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
};

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
  }
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

export const productSchema = ({ photo, offerPrices = [], canonicalPath }) => {
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
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@id': ORGANIZATION_ID
      }
    }
  };

  if (lowPrice) schema.offers.lowPrice = lowPrice;
  if (highPrice) schema.offers.highPrice = highPrice;
  if (prices.length) schema.offers.offerCount = String(prices.length);

  return schema;
};

export const baseGraph = () => [organizationSchema(), websiteSchema()];
