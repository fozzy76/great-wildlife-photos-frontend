import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import SEO from '@/components/SEO.jsx';
import { aboutHero, aboutHeading, aboutBody, aboutCredentials, aboutPortrait } from '@/data/aboutContent.js';
import { DEFAULT_SEO_IMAGE, baseGraph, breadcrumbSchema, webPageSchema } from '@/lib/seo.js';
import { STATIC_ROUTES } from '@/lib/routeMeta.js';

const AboutPage = () => {
  return (
    <main className="min-h-screen">
      <SEO
        {...STATIC_ROUTES['/about']}
        schema={[
          ...baseGraph(),
          webPageSchema({
            path: '/about',
            name: 'About Lynn Starnes',
            description: "Learn about Lynn Starnes, award-winning North American wildlife photographer.",
            type: 'AboutPage',
            image: DEFAULT_SEO_IMAGE
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' }
          ])
        ]}
      />

      {/* Hero Banner */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center pt-20">
        <div 
          className="absolute inset-0"
          style={{ 
            // Lynn's own work, not a stock landscape — this is her About page.
            backgroundImage: 'url(https://images.greatwildlifephotos.com/photos/fb-2026-bobcat-in-snow-lbs9571-copy-1781792895936.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.6))' }}
        />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg mb-4">{aboutHero.heading}</h1>
          <p className="text-lg md:text-xl text-gray-100 drop-shadow-lg leading-relaxed">{aboutHero.standfirst}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-24">
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              {/* Lynn at work in a photography blind. Replaces a stock library
                  photo that was captioned "Lynn Starnes Portrait" — it was not
                  her, and the alt text asserted that it was. */}
              <figure className="rounded-2xl overflow-hidden shadow-lg">
                <picture>
                  <source srcSet={aboutPortrait.webp} type="image/webp" />
                  <img
                    src={aboutPortrait.jpg}
                    alt={aboutPortrait.alt}
                    className="w-full h-auto object-cover"
                    width={aboutPortrait.width}
                    height={aboutPortrait.height}
                    loading="lazy"
                  />
                </picture>
                <figcaption className="bg-muted/40 px-4 py-3 text-sm text-muted-foreground italic">{aboutPortrait.caption}</figcaption>
              </figure>

              <div className="mt-6 rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 font-serif text-lg font-bold text-foreground">Credentials</h3>
                <dl className="space-y-3 text-sm">
                  {aboutCredentials.map((c) => (
                    <div key={c.label}>
                      <dt className="font-semibold text-foreground">{c.label}</dt>
                      <dd className="text-muted-foreground">
                        {c.lines.map((line, i) => (
                          <React.Fragment key={i}>{line}{i < c.lines.length - 1 ? <br /> : null}</React.Fragment>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-lg text-muted-foreground leading-relaxed">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">{aboutHeading}</h2>
            {aboutBody.map((block, i) => (
              <p
                key={i}
                className={block.type === 'quote' ? 'border-l-4 border-primary/40 pl-6 italic text-foreground' : undefined}
              >
                {block.type === 'quote' ? `“${block.text}”` : block.text}
              </p>
            ))}
            <div className="pt-6">
              <Button asChild size="lg" className="h-14 px-8 text-lg">
                <Link to="/gallery">Shop the Collection</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-16 pb-16">
          <Card className="bg-muted/30 border-none shadow-none">
            <CardContent className="p-8 md:p-12">
              <h3 className="text-3xl font-serif font-bold mb-8 text-foreground">About the Prints</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-muted-foreground leading-relaxed">
                <div className="space-y-6">
                  <p>
                    Every photograph is custom-produced on-demand to ensure the highest quality for your space. We have partnered with MerchOne for our production and fulfillment, utilizing museum-quality materials designed to resist fading and last for generations.
                  </p>
                  <p>
                    Our fine art pieces are exclusively available on premium substrates, including striking acrylic, sleek aluminum metal, and classic gallery-wrapped canvas. Because we operate on an on-demand production model, each piece is individually crafted with uncompromising attention to detail the moment you place your order.
                  </p>
                </div>
                <div className="space-y-6">
                  <h4 className="text-xl font-serif font-bold text-foreground">Copyright & Trademarks</h4>
                  <p>
                    All photographs, images, and content on this website are the exclusive intellectual property of Lynn Starnes and are protected under United States and international copyright laws.
                  </p>
                  <p>
                    Unauthorized reproduction, distribution, public display, or commercial use of any image on this site is strictly prohibited. Purchasing a print does not transfer copyright or grant reproduction rights for any purpose.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
