import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Palette, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const API_BASE = 'https://api.greatwildlifephotos.com';

const HomePage = () => {
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPhotos = async () => {
      try {
        const res = await fetch(API_BASE + '/products/featured');
        const data = await res.json();
        if (data.success) setFeaturedPhotos(data.products.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch featured photos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedPhotos();
  }, []);

  return (
    <>
      <Helmet>
        <title>Great Wildlife Photos - Premium Wildlife Photography Prints</title>
        <meta name="description" content="Discover stunning wildlife photography prints by Lynn Starnes. Premium canvas, metal, and acrylic prints of North American wildlife." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[75vh] mb-0 flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.greatwildlifephotos.com/photos/fb-2026-bobcat-in-snow-lbs9571-copy-1781792895936.jpg)',
            filter: 'brightness(0.45)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-zinc-950" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6" style={{ letterSpacing: '-0.02em' }}>
              Where the Wild Meets the Wall
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Award-winning wildlife photography by Lynn Starnes. Printed on premium canvas, metal, and acrylic - North American wildlife captured in its most breathtaking moments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]">
                <Link to="/gallery">Explore gallery <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
            <p className="text-sm text-gray-400 text-center mt-6 tracking-wide uppercase">
              Named Top 25 · Nature's Best Photography · Smithsonian Institution 2018
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Photos */}
      <section className="py-16 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Featured collection</h2>
            <p className="text-base text-gray-400 max-w-xl mx-auto">
              Explore our most popular wildlife photographs, available in multiple sizes and premium materials.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            </div>
          ) : featuredPhotos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No featured photos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ borderRadius: '16px', overflow: 'hidden' }}
                  className="shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Link to={`/photo/${photo.slug}`} className="block group">
                    <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
                      <img
                        src={photo.r2_url || photo.photo_url}
                        alt={`${photo.title} - Fine art wildlife photography print by Lynn Starnes`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        className="group-hover:scale-105"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'; }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px' }}>
                        <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600, marginBottom: '4px' }}>{photo.title}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{photo.category}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 transition-all duration-200">
              <Link to="/gallery">View all photos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Camera className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Professional quality</h3>
              <p className="text-gray-400 leading-relaxed">
                Lynn Starnes has spent decades in the field capturing North American wildlife - Black Bears, Wild Horses, Mule Deer, Bighorn Sheep, Elk, and the stunning Lake Tahoe region. Her polar bear images were named Top 25 in Nature's Best Photography by the Smithsonian Institution in 2018. Every print is produced on museum-quality materials and fulfilled by MerchOne.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Palette className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Premium materials</h3>
              <p className="text-gray-400 leading-relaxed">
                Choose from canvas, metal, or acrylic. Each material is hand-selected to complement the subject - metal for dramatic light and high contrast, acrylic for vivid color depth, canvas for a warm, classic gallery feel.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Truck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Fast, secure shipping</h3>
              <p className="text-gray-400 leading-relaxed">
                Every order is printed to order and shipped with care. US and Canada orders ship directly through MerchOne. International customers - contact Lynn directly for fulfillment options.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to bring the wild home?</h2>
            <p className="text-lg mb-8 text-gray-400 max-w-2xl mx-auto">
              Browse Lynn's complete collection - from Arctic polar bears to Sierra Nevada sunsets. Each print is a moment captured once, in the wild. All shots are natural, wild.
            </p>
            <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]">
              <Link to="/gallery">Start exploring <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
