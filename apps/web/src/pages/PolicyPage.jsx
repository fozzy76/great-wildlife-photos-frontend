import { Link } from 'react-router-dom';
import SEO from '@/components/SEO.jsx';
import { DEFAULT_SEO_IMAGE, baseGraph, breadcrumbSchema, webPageSchema } from '@/lib/seo.js';

// Shared renderer for the Shipping and Returns policy pages.
//
// Content comes from src/data/policies.js, which tools/prerender.mjs imports too,
// so the static HTML a crawler sees and the hydrated DOM a visitor sees are built
// from the same source and cannot drift.
//
// These pages exist because Google Merchant Center requires a returns policy URL
// and shipping detail, and the store had neither — the only statement of either
// lived inside an FAQ accordion, hidden until clicked.
export default function PolicyPage({ policy }) {
  const path = `/${policy.slug}`;

  return (
    <div className="w-full">
      <SEO
        title={policy.title}
        description={policy.description}
        path={path}
        image={DEFAULT_SEO_IMAGE}
        schema={[
          ...baseGraph(),
          webPageSchema({ path, name: policy.title, description: policy.description, image: DEFAULT_SEO_IMAGE }),
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: policy.heading, path }]),
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{policy.heading}</h1>

        <p className="mt-5 text-base leading-relaxed text-muted-foreground">{policy.intro}</p>

        {policy.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-xl font-medium">{section.heading}</h2>
            {section.body.map((para, i) => (
              <p key={i} className="mt-3 text-base leading-relaxed text-muted-foreground">{para}</p>
            ))}
          </section>
        ))}

        <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          See also{' '}
          <Link to={policy.slug === 'returns' ? '/shipping' : '/returns'} className="text-primary hover:underline">
            {policy.slug === 'returns' ? 'Shipping' : 'Returns & Refunds'}
          </Link>
          {' · '}
          <Link to="/faq" className="text-primary hover:underline">FAQ</Link>
          {' · '}
          <Link to="/contact" className="text-primary hover:underline">Contact</Link>
        </p>
      </div>
    </div>
  );
}
