import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent } from '@/components/ui/card.jsx';

const AboutPage = () => {
  return (
    <main className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center pt-20">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1504596408109-c4aa974c81d2?q=80&w=2000&auto=format&fit=crop)',
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
            <div className="rounded-2xl overflow-hidden shadow-lg sticky top-24">
              <img 
                src="https://images.unsplash.com/photo-1607010063495-a18e40ec6ff3?q=80&w=800&auto=format&fit=crop" 
                alt="Lynn Starnes Portrait" 
                className="w-full h-auto object-cover aspect-[4/5]"
              />
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '8px', fontStyle: 'italic' }}>Photo of Lynn coming soon</p>
            </div>
          </div>
          
          <div className="lg:col-span-7 space-y-6 text-lg text-muted-foreground leading-relaxed">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-6">The Artist Behind the Lens</h2>
            <p>
              Lynn grew up with a deep connection to the natural world. She learned to ride horses before she learned to drive, and that bond with animals has shaped every photograph she has ever taken. Wildlife photography was never a career choice - it was an inevitability.
            </p>
            <p>
              Her specialty is North American wildlife in its most authentic moments. Her collections include Black Bears (from black bears to coastal browns to polar bears in the high Arctic), Wild Horses captured in motion at sunrise, Mule Deer at dawn in arid canyon country, Bighorn Sheep in the rugged terrain of the American West, Bull Elk during the rut with storm skies behind them, and the four-season beauty of Lake Tahoe - including rare lightning captures and Northern Lights over Emerald Bay.
            </p>
            <p>
              In 2018, Lynn's polar bear images were named Top 25 in Nature's Best Photography, a prestigious international competition judged in partnership with the Smithsonian Institution. Those images were captured on the Arctic ice - a shoot that required as much survival preparation as photographic skill.
            </p>
            <p>
              Every photograph in this store was captured in the wild. Nothing is staged, nothing is manipulated. What you see is what Lynn saw through the lens - and what she risked the cold, the altitude, and the silence to bring back for you.
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
