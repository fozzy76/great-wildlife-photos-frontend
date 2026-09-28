import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext.jsx';
import MaterialMockup from '@/components/MaterialMockup.jsx';
import SEO from '@/components/SEO.jsx';
import { trackViewItem } from '@/lib/analytics.js';
import { baseGraph, breadcrumbSchema, productSchema, truncateText, webPageSchema } from '@/lib/seo.js';

const API_BASE = 'https://api.greatwildlifephotos.com';

const PhotoDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [photo, setPhoto] = useState(null);
  const [variants, setVariants] = useState(null);
  const [markupPct, setMarkupPct] = useState(50);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState('canvas');
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [allSlugs, setAllSlugs] = useState([]);
  // 'not-found' when the API says there is no such photo, 'failed' when the lookup itself
  // failed. Either way this page stays on its own URL — see the comments at the two
  // setLoadError calls below.
  const [loadError, setLoadError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
// The prerender embeds this page's product record and variant prices as JSON. React
// clears #root on mount, so WITHOUT this the prerendered content disappears the moment
// the app boots and the page has nothing until the API answers.
//
// 🔴 That is not theoretical. The 2026-09-23 fix stopped this page navigating to /gallery/
// when the API call failed and rendered an error state in place instead. On 2026-09-27
// Google crawled two pages during such a failure and recorded BOTH as Soft 404 — they had
// been indexed. Measured 2026-09-28 by blocking api.greatwildlifephotos.com and rendering
// as Googlebot: 826 characters, "This photograph could not be loaded", no h1, no price.
// Redirecting lost the URL; erroring in place lost the content. Both came from the same
// root cause — the content only existed after a successful runtime fetch.
//
// So: seed state from the embedded record, then refresh from the API. A transient failure
// now leaves the page showing the product instead of an error.
const embeddedPhotoData = (slug) => {
  try {
    const el = document.getElementById('gwp-photo-data');
    if (!el) return null;
    const data = JSON.parse(el.textContent || 'null');
    if (!data || !data.photo || data.photo.slug !== slug) return null;
    return data;
  } catch {
    return null;
  }
};

  const materialParam = (searchParams.get('material') || '').toLowerCase();
  const variantParam = parseInt(searchParams.get('variant') || '', 10);

  // Seed from the prerendered record before the network is involved at all.
  useEffect(() => {
    const seed = embeddedPhotoData(slug);
    if (!seed) return;
    setPhoto((cur) => cur || seed.photo);
    if (Number.isFinite(Number(seed.markupPct))) setMarkupPct((cur) => (cur === 50 ? Number(seed.markupPct) : cur));
    if (seed.variants && Object.keys(seed.variants).length) {
      setVariants((cur) => cur || seed.variants);
      // A default material and size must be chosen here too, not only on the API path.
      // Without it the seeded page rendered the photograph with NO PRICE — better than a
      // Soft 404 and still a product page a buyer cannot act on. Honour the ?material= and
      // ?variant= parameters so a variant URL seeds the variant it names.
      const materials = Object.keys(seed.variants);
      let nextMaterial = seed.variants.canvas ? 'canvas' : materials[0];
      let nextVariantId = seed.variants[nextMaterial]?.sizes?.[0]?.id ?? null;
      if (materialParam && seed.variants[materialParam]) {
        nextMaterial = materialParam;
        nextVariantId = seed.variants[nextMaterial]?.sizes?.[0]?.id ?? null;
      }
      if (Number.isFinite(variantParam)) {
        for (const material of materials) {
          const requested = (seed.variants[material]?.sizes || []).find((size) => size.id === variantParam);
          if (requested) { nextMaterial = material; nextVariantId = requested.id; break; }
        }
      }
      setSelectedMaterial((cur) => cur || nextMaterial);
      setSelectedVariantId((cur) => cur ?? nextVariantId);
    }
    setLoading(false);
  }, [slug, materialParam, variantParam]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch photo and config in parallel first
        const [photoRes, configRes] = await Promise.all([
          fetch(API_BASE + '/products/slug/' + slug),
          fetch(API_BASE + '/catalog/config')
        ]);
        const photoData = await photoRes.json();
        const configData = await configRes.json();

        if (configData.success) {
          setMarkupPct(configData.markup_percentage);
        }

        if (!photoData.success || !photoData.product) {
          // 🔴 NEVER navigate away from a product URL. Until 2026-09-11 this redirected to
          // /gallery, and Googlebot recorded precisely that: 30 product pages came back as
          // "Page with redirect" with /gallery/ chosen as their canonical, so 30 products
          // could not appear in search at all. Keep the URL and render the state in place.
          toast.error('Photo not found');
          setLoadError('not-found');
          return;
        }

        const photo = photoData.product;
        setPhoto(photo);

        // Slugs for prev/next navigation.
        //
        // This used to request a flat /products?limit=50. Once the catalogue
        // grew past 50 photos, anything outside that first page resolved to
        // index -1, and the arrow handler bails on -1 — so the buttons looked
        // enabled but did nothing.
        //
        // Navigate within the photo's own collection instead, which is what a
        // visitor browsing Wild Horses expects, and page through in case a
        // collection ever exceeds the API's 100-per-page cap.
        try {
          const PAGE = 100;
          const collect = async (query) => {
            let out = [];
            for (let offset = 0; ; offset += PAGE) {
              const res = await fetch(`${API_BASE}/products?${query}&limit=${PAGE}&offset=${offset}`);
              const data = await res.json();
              const batch = (data && data.products) || [];
              out = out.concat(batch);
              if (batch.length < PAGE) break;
              if (offset > 1000) break;
            }
            return out;
          };

          let list = photo.category
            ? await collect(`category=${encodeURIComponent(photo.category)}`)
            : [];
          // Fall back to the whole catalogue if the category lookup comes back
          // empty or somehow omits this photo.
          if (!list.some((p) => p.slug === photo.slug)) list = await collect('sort=newest');

          const slugs = list.map((p) => p.slug);
          setAllSlugs(slugs);
          setCurrentIndex(slugs.indexOf(photo.slug));
        } catch (e) {
          console.warn('Failed to fetch product list for navigation:', e.message);
        }

        // Fetch compatible variants for this specific photo
        const variantRes = await fetch(API_BASE + '/catalog/variants/compatible/' + photo.id + '?t=' + Date.now(), {
          cache: 'no-store'
        });
        const variantData = await variantRes.json();

        if (variantData.success && variantData.variants) {
          const materials = Object.keys(variantData.variants);
          if (materials.length > 0) {
            setVariants(variantData.variants);
            let nextMaterial = materials[0];
            let nextVariantId = variantData.variants[nextMaterial].sizes[0].id;

            if (materialParam && variantData.variants[materialParam]) {
              nextMaterial = materialParam;
              nextVariantId = variantData.variants[nextMaterial].sizes[0].id;
            }

            if (Number.isFinite(variantParam)) {
              for (const material of materials) {
                const requestedVariant = variantData.variants[material].sizes.find(size => size.id === variantParam);
                if (requestedVariant) {
                  nextMaterial = material;
                  nextVariantId = requestedVariant.id;
                  break;
                }
              }
            }

            setSelectedMaterial(nextMaterial);
            setSelectedVariantId(nextVariantId);
          } else {
            console.warn('No compatible variants found for photo', photo.id);
            setVariants({});
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // 🔴 If the prerendered record is on the page, KEEP SHOWING IT. Rendering an error
        // over real content is what produced two Soft 404s on 2026-09-27. Only a page with
        // nothing to show may show the failure state.
        if (embeddedPhotoData(slug)) {
          console.warn('API unreachable — serving the prerendered record for', slug);
        } else {
          toast.error('Failed to load photo');
          // Same rule as above: a transient API failure must not move a crawler off this URL.
          setLoadError('failed');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, navigate, materialParam, variantParam]);

  const navigateToPhoto = (direction) => {
    if (allSlugs.length === 0 || currentIndex === -1) return;
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = allSlugs.length - 1; // wrap to last
    if (newIndex >= allSlugs.length) newIndex = 0; // wrap to first
    navigate('/photo/' + allSlugs[newIndex]);
  };

  const handleMaterialChange = (material) => {
    setSelectedMaterial(material);
    if (variants[material] && variants[material].sizes && variants[material].sizes.length > 0) {
      setSelectedVariantId(variants[material].sizes[0].id);
    }
  };

  const getSelectedVariant = () => {
    if (!variants || !selectedMaterial || !selectedVariantId) return null;
    return variants[selectedMaterial].sizes.find(s => s.id === selectedVariantId) || null;
  };

  const getFinalPrice = (variant) => {
    if (!photo || !variant) return 0;
      const markup = markupPct / 100;
    return variant.wholesale * (1 + markup) + parseFloat(photo.base_price);
  };


  const handleAddToCart = () => {
    const variant = getSelectedVariant();
    if (!photo || !variant) return;
    setAddingToCart(true);
    try {
      addToCart({
        photoId: photo.id,
        title: photo.title,
        photo_url: photo.r2_url || photo.photo_url,
        material: selectedMaterial,
        variantId: variant.id,
        size: variant.name,
        price: getFinalPrice(variant),
        shipping: variant.shipping,
        quantity
      });
      toast.success('Added to cart');
      setJustAdded(true);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    const variant = getSelectedVariant();
    if (!photo || !variant) return;
    trackViewItem(photo, variant, getFinalPrice(variant));
  }, [photo?.id, selectedVariantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <Skeleton className="h-[520px] rounded-2xl" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // The photo could not be loaded — either the API has no such slug, or the lookup failed.
  //
  // 🔴 This branch replaces a redirect to /gallery and a bare `return null`, and BOTH were
  // harmful to a crawler: the redirect cost 30 products their place in Google (each came back
  // "Page with redirect", canonical /gallery/), and an empty render offers nothing to a visitor
  // who followed a real link.
  //
  // Deliberately NO <SEO> here. The prerendered <head> already carries this URL's own title,
  // description and self-canonical; rendering a different SEO block would overwrite correct
  // tags with an error state on what is usually a transient failure.
  if (loadError || !photo || !variants) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate('/gallery')} className="my-4 mb-8">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to gallery
          </Button>
          <div className="rounded-lg p-8 text-center" style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
            <p className="text-lg font-semibold mb-2">
              {loadError === 'not-found' ? 'This photograph is not available' : 'This photograph could not be loaded'}
            </p>
            <p className="text-sm text-muted-foreground">
              {loadError === 'not-found'
                ? 'It may have been renamed or withdrawn. The full collection is in the gallery.'
                : 'Please reload the page. If it keeps happening, contact us and we will sort it out.'}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button asChild variant="outline">
                <Link to="/gallery">Browse the gallery</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const materials = Object.keys(variants);
  const selectedVariant = getSelectedVariant();
  const categoryPath = '/gallery?category=' + encodeURIComponent(photo.category || '');
  const canonicalPath = `/photo/${photo.slug}`;
  const photoImage = photo.r2_url || photo.photo_url;
  const photoDescription = truncateText(photo.description || `Premium ${photo.category} wildlife photography print by Lynn Starnes, available on canvas, metal, and acrylic.`, 155);
  const offerPrices = Object.values(variants || {})
    .flatMap(material => material?.sizes || [])
    .map(size => getFinalPrice(size));
  // One entry per purchasable material/size so productSchema can emit a real Offer for
  // each (merchant listings require Offer, not AggregateOffer). sku matches the Merchant
  // Center feed's item id scheme so the page and the feed name the same thing.
  const offerList = Object.entries(variants || {}).flatMap(([material, m]) =>
    (m?.sizes || [])
      .map(size => ({
        material,
        variantId: size?.id,
        price: getFinalPrice(size),
        sku: size?.id ? `gwp-${photo?.id}-${material}-${size.id}` : undefined,
      }))
      .filter(o => o.variantId && Number.isFinite(o.price) && o.price > 0)
  );

  // No compatible print sizes for this photo's resolution/aspect ratio
  if (materials.length === 0) {
    return (
      <>
        <SEO
          title={`${photo.title} - Great Wildlife Photos`}
          description={photoDescription}
          path={canonicalPath}
          image={photoImage}
          type="product"
          schema={[
            ...baseGraph(),
            webPageSchema({
              path: canonicalPath,
              name: `${photo.title} - Great Wildlife Photos`,
              description: photoDescription,
              type: 'ItemPage',
              image: photoImage
            }),
            productSchema({ photo, offerPrices, offerList, canonicalPath }),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Gallery', path: '/gallery' },
              { name: photo.title, path: canonicalPath }
            ])
          ]}
        />
        <div className="min-h-screen bg-background py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" onClick={() => navigate('/gallery')} className="my-4 mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to gallery
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3">
                <div className="relative overflow-hidden shadow-xl" style={{ height: '520px', objectFit: 'cover', borderRadius: '16px' }}>
                  <img
                    src={`https://api.greatwildlifephotos.com/image-proxy?url=${encodeURIComponent(photo?.r2_url || photo?.photo_url)}`}
                    alt={`${photo?.title} - Fine art wildlife photography print by Lynn Starnes`}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <Link to={categoryPath} className="inline-flex text-sm font-medium text-primary mb-2 hover:text-primary/80 transition-colors">
                    {photo.category}
                  </Link>
                  <h1 className="text-4xl font-bold mb-4">{photo.title}</h1>
                </div>
                {photo.description && (
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Description</h2>
                    <p className="text-muted-foreground leading-relaxed">{photo.description}</p>
                  </div>
                )}
                <div className="rounded-lg p-6 text-center" style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-lg font-semibold mb-2">Print sizing in progress</p>
                  <p className="text-sm text-muted-foreground">This photograph is currently being prepared for print production. Please check back soon or contact us at lynn@greatwildlifephotos.com for custom sizing options.</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/contact')}>Contact us</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  const finalPrice = getFinalPrice(selectedVariant);

  return (
    <>
      <SEO
        title={`${photo.title} - Great Wildlife Photos`}
        description={photoDescription}
        path={canonicalPath}
        image={photoImage}
        type="product"
        schema={[
          ...baseGraph(),
          webPageSchema({
            path: canonicalPath,
            name: `${photo.title} - Great Wildlife Photos`,
            description: photoDescription,
            type: 'ItemPage',
            image: photoImage
          }),
          productSchema({ photo, offerPrices, offerList, canonicalPath }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Gallery', path: '/gallery' },
            { name: photo.title, path: canonicalPath }
          ])
        ]}
      >
        {photo.width && <meta property="og:image:width" content={String(photo.width)} />}
        {photo.height && <meta property="og:image:height" content={String(photo.height)} />}
      </SEO>

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between my-4 mb-8">
            <Button variant="ghost" onClick={() => navigate('/gallery')}>
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to gallery
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateToPhoto(-1)}
                disabled={currentIndex === -1 || allSlugs.length < 2}
                title="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateToPhoto(1)}
                disabled={currentIndex === -1 || allSlugs.length < 2}
                title="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <div className="lg:col-span-3">
              <div 
                className="relative overflow-hidden shadow-xl" 
                style={{ height: '520px', objectFit: 'cover', borderRadius: '16px' }}
              >
                <img
                  src={`https://api.greatwildlifephotos.com/image-proxy?url=${encodeURIComponent(photo?.r2_url || photo?.photo_url)}`}
                  alt={`${photo?.title} - Fine art wildlife photography print on canvas, metal, or acrylic by Lynn Starnes`}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'; }}
                />
              </div>
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <h3 className="font-semibold text-white mb-1">Photographed by Lynn Starnes</h3>
                <p className="text-sm text-gray-300">Award-winning wildlife photographer · 30+ years in the field · Named Top 25, Nature's Best Photography, Smithsonian Institution 2018</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <Link to={categoryPath} className="inline-flex text-sm font-medium text-primary mb-2 hover:text-primary/80 transition-colors">
                  {photo.category}
                </Link>
                <h1 className="text-4xl font-bold mb-4">{photo.title}</h1>
                {selectedVariant && (
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-primary">${finalPrice.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">+ ${selectedVariant.shipping.toFixed(2)} shipping</p>
                  </div>
                )}
              </div>

              {photo.description && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground leading-relaxed">{photo.description}</p>
                </div>
              )}

              <div className="space-y-4 pt-6 border-t border-border">
                <div>
                  <label className="block text-sm font-medium mb-2">Material</label>
                  <Select value={selectedMaterial} onValueChange={handleMaterialChange}>
                    <SelectTrigger className="bg-white text-gray-900"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {materials.map(mat => (
                        <SelectItem key={mat} value={mat}>
                          {mat.charAt(0).toUpperCase() + mat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <MaterialMockup material={selectedMaterial} imageUrl={photo?.r2_url || photo?.photo_url} variant={selectedVariant} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Size</label>
                  <Select value={String(selectedVariantId)} onValueChange={(val) => setSelectedVariantId(parseInt(val))}>
                    <SelectTrigger className="bg-white text-gray-900"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {variants[selectedMaterial].sizes.map(size => (
                        <SelectItem key={size.id} value={String(size.id)}>
                          {size.name}, ${(size.wholesale * (1 + markupPct / 100) + parseFloat(photo.base_price)).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Quantity</label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {selectedVariant && (
                  <div 
                    className="rounded-lg p-4 text-sm space-y-1" 
                    style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex justify-between text-gray-200">
                      <span>Print price</span>
                      <span>${(finalPrice * quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-200">
                      <span>Shipping</span>
                      <span>${selectedVariant.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-white/10 pt-2 mt-2 text-white">
                      <span>Total</span>
                      <span>${((finalPrice * quantity) + selectedVariant.shipping).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !selectedVariant}
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  {addingToCart ? 'Adding...' : 'Add to cart'}
                </Button>

                {justAdded && (
                  <Button
                    onClick={() => navigate('/checkout')}
                    size="lg"
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 w-5 h-5" />
                    Checkout · ${((finalPrice * quantity) + selectedVariant.shipping).toFixed(2)}
                  </Button>
                )}
              </div>

              <div className="pt-6 border-t border-border space-y-2 text-sm text-muted-foreground">
                <p>• Premium quality printing on selected material</p>
                <p>• Carefully packaged for safe delivery</p>
                <p>• Tracking provided for all orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhotoDetailPage;
