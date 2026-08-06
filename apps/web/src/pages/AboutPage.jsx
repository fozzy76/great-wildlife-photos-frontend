import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';
import SEO from '@/components/SEO.jsx';
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
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg mb-4">
            Three Decades in the Wild
          </h1>
          <p className="text-lg md:text-xl text-gray-100 drop-shadow-lg leading-relaxed">
            Lynn Starnes is an award-winning wildlife photographer whose images have been recognized by the Smithsonian Institution. She has spent over thirty years pursuing North American wildlife in its most remote and extreme environments, from the Arctic to the ridgelines of the Sierra Nevada.
          </p>
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
                  <source srcSet="/images/lynn-starnes-in-the-blind.webp" type="image/webp" />
                  <img
                    src="/images/lynn-starnes-in-the-blind.jpg"
                    alt="Lynn Starnes photographing from inside a camouflaged blind, behind a large telephoto lens"
                    className="w-full h-auto object-cover"
                    width="756"
                    height="784"
                    loading="lazy"
                  />
                </picture>
                <figcaption className="bg-muted/40 px-4 py-3 text-sm text-muted-foreground italic">
                  Lynn at work — waiting inside a blind, behind the long lens. Most of wildlife
                  photography is the waiting.
                </figcaption>
              </figure>

              <div className="mt-6 rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 font-serif text-lg font-bold text-foreground">Credentials</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold text-foreground">Education</dt>
                    <dd className="text-muted-foreground">
                      B.S. Zoology, University of Tennessee (1972)<br />
                      M.S. Aquatic Ecology, University of Tennessee (1976)
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Career</dt>
                    <dd className="text-muted-foreground">
                      U.S. Fish and Wildlife Service, 1984–2006<br />
                      Tennessee Valley Authority, 1974–1984<br />
                      Peace Corps, West Africa, 1972–1974
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Recognition</dt>
                    <dd className="text-muted-foreground">
                      Top 25, Nature&rsquo;s Best / Smithsonian, 2018<br />
                      Registered Fisheries Scientist, American Fisheries Society
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Conservation</dt>
                    <dd className="text-muted-foreground">
                      Nevada Bighorns Unlimited &middot; Wild Sheep Foundation &middot; Rocky Mountain Elk Foundation
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-lg text-muted-foreground leading-relaxed">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">A biologist first, a photographer second</h2>
            <p>
              Lynn Starnes spent thirty-eight years as a fish and wildlife biologist &mdash; researching
              animals, running field studies, and managing habitat &mdash; before most people ever saw
              one of her photographs. She has a master&rsquo;s degree in aquatic ecology, twenty-two
              years with the U.S. Fish and Wildlife Service behind her, and a Peace Corps posting in
              West Africa before that.
            </p>
            <p className="border-l-4 border-primary/40 pl-6 italic text-foreground">
              &ldquo;The advantage of being a biologist first and a photographer second is my
              knowledge of animal behavior and habitats. I see animals I am studying eating,
              sleeping, in their mating rituals, and even playing. Most tourists who visit
              America&rsquo;s wild lands rarely have the time to let animals acclimate to their
              presence, so they rarely see animals being wild, natural, relaxed animals.&rdquo;
            </p>
            <p>
              She calls herself an &ldquo;ambush photographer.&rdquo; There is no posing a bull elk.
              What she does instead is wait &mdash; sometimes passing up the early, easy shots
              entirely &mdash; until an animal forgets she is there.
            </p>
            <p className="border-l-4 border-primary/40 pl-6 italic text-foreground">
              &ldquo;Photography for me is fundamentally a waiting game. I wait for the animal to
              exhibit postures that I think are expressive. The expression of the animal, such as the
              eyes looking directly into the lens, or the position of the body, will make the
              difference between a marketable and possibly award-winning image or a throw away.&rdquo;
            </p>
            <p>
              That patience is what produced the polar bear photograph judged in the top 25 of almost
              70,000 entries for Nature&rsquo;s Best / Smithsonian in 2018 &mdash; made during two
              weeks at the Arctic Circle in weather that never rose above &minus;27&nbsp;&deg;F, and
              dropped as low as &minus;46&nbsp;&deg;F as Hudson Bay froze over and the bears began
              hunting seals, their first food in months.
            </p>
            <p>
              Every photograph sold here was made in the wild. Nothing is staged and nothing is
              posed. It is the animal, the light, and however long it took.
            </p>
            <p className="border-l-4 border-primary/40 pl-6 italic text-foreground">
              &ldquo;Hopefully, I can inspire you to love these wild animals that have been my life,
              and to help conserve these wild animals and their habitats for future generations.&rdquo;
            </p>
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
