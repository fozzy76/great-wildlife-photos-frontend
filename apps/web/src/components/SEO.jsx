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
