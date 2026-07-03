import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

const API_BASE = 'https://api.greatwildlifephotos.com';

const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [markupPct, setMarkupPct] = useState(50);
  const [minWholesale, setMinWholesale] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const ts = Date.now(); // Cache buster
        const [configRes, variantRes, categoryRes] = await Promise.all([
          fetch(API_BASE + `/catalog/config?t=${ts}`),
          fetch(API_BASE + `/catalog/variants?t=${ts}`),
          fetch(API_BASE + `/products/categories/list?t=${ts}`)
        ]);
        const configData = await configRes.json();
        const variantData = await variantRes.json();
        const categoryData = await categoryRes.json();

        if (configData.success) setMarkupPct(configData.markup_percentage);
        if (categoryData.success) setCategories(categoryData.categories);

        if (variantData.success) {
          const allWholesale = Object.values(variantData.variants)
          .flatMap(mat => mat.sizes.map(s => s.wholesale));
          setMinWholesale(Math.min(...allWholesale));
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const ts = Date.now(); // Cache buster
        let url = API_BASE + `/products?limit=50&offset=0&t=${ts}`;
        if (categoryFilter !== 'all') {
          url += '&category=' + encodeURIComponent(categoryFilter);
        }
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          let items = data.products;
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            items = items.filter(p => p.title.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
          }
          setPhotos(items);
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPhotos();
  }, [searchTerm, categoryFilter]);

  const getFromPrice = (photo) => {
    const markup = markupPct / 100;
    return (minWholesale * (1 + markup) + parseFloat(photo.base_price)).toFixed(2);
  };

  return (
    <>
      <Helmet>
        <title>Wildlife Photography Prints Gallery | Great Wildlife Photos</title>
        <meta name="description" content="Browse award-winning North American wildlife photography prints by Lynn Starnes. Canvas, metal, and acrylic prints of bobcats, bears, wild horses, elk, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Wildlife Photography Prints Gallery | Great Wildlife Photos" />
        <meta property="og:description" content="Browse award-winning North American wildlife photography prints by Lynn Starnes. Canvas, metal, and acrylic prints." />
        <meta property="og:image" content="https://images.greatwildlifephotos.com/photos/fb-2026-bobcat-in-snow-lbs9571-copy-1781792895936.jpg" />
        <meta property="og:url" content="https://greatwildlifephotos.com/gallery" />
        <meta property="og:site_name" content="Great Wildlife Photos" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://images.greatwildlifephotos.com/photos/fb-2026-bobcat-in-snow-lbs9571-copy-1781792895936.jpg" />
      </Helmet>

      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Photo gallery</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Lynn Starnes has photographed North American wildlife for over three decades. These are her award-winning images, now available as premium fine art prints on canvas, metal, and acrylic. Each photograph was captured in the wild. All shots are natural, wild.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900 rounded-2xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-gray-900 placeholder:text-gray-500"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white text-gray-900">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-72 rounded-2xl" />)}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-2xl">
              <p className="text-lg text-muted-foreground">No photos found matching your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photos.map(photo => (
                <Link
                  key={photo.id}
                  to={`/photo/${photo.slug}`}
                  className="group block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card"
                >
                  <div className="relative" style={{ height: '320px' }}>
                    <img
                      src={photo.r2_url || photo.photo_url}
                      alt={`${photo.title} - ${photo.category} wildlife photography print`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none">
                      <h3 className="text-xl font-semibold text-white mb-2">{photo.title}</h3>
                      <p className="text-sm text-gray-300 mb-2">{photo.category}</p>
                      <p className="text-lg font-semibold text-primary">From ${getFromPrice(photo)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GalleryPage;
