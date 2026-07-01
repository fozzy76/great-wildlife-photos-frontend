import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext.jsx';
import MaterialMockup from '@/components/MaterialMockup.jsx';

const API_BASE = 'https://api.greatwildlifephotos.com';

const PhotoDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photoRes, variantRes, configRes] = await Promise.all([
          fetch(API_BASE + '/products/slug/' + slug),
          fetch(API_BASE + '/catalog/variants'),
          fetch(API_BASE + '/catalog/config')
        ]);
        const photoData = await photoRes.json();
        const variantData = await variantRes.json();
        const configData = await configRes.json();

        if (configData.success) {
          setMarkupPct(configData.markup_percentage);
        }

        if (photoData.success && photoData.product) {
          setPhoto(photoData.product);
        } else {
          toast.error('Photo not found');
          navigate('/gallery');
          return;
        }

        if (variantData.success) {
          setVariants(variantData.variants);
          setSelectedVariantId(variantData.variants.canvas.sizes[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load photo');
        navigate('/gallery');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, navigate]);

  const handleMaterialChange = (material) => {
    setSelectedMaterial(material);
    setSelectedVariantId(variants[material].sizes[0].id);
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

  if (!photo || !variants) return null;

  const selectedVariant = getSelectedVariant();
  const materials = Object.keys(variants);
  const finalPrice = getFinalPrice(selectedVariant);

  return (
    <>
      <Helmet>
        <title>{`${photo.title} - Great Wildlife Photos`}</title>
        <meta name="description" content={photo.description || `Premium ${photo.category} wildlife photography print available in multiple sizes and materials.`} />
        
        <meta property="og:title" content={`${photo.title} - Great Wildlife Photos`} />
        <meta property="og:description" content={photo.description || `Premium ${photo.category} wildlife photography print available in multiple sizes and materials.`} />
        <meta property="og:image" content={photo.r2_url || photo.photo_url} />
        <meta property="og:url" content={`https://greatwildlifephotos.com/photo/${photo.slug}`} />
        <meta property="og:type" content="product" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${photo.title} - Great Wildlife Photos`} />
        <meta name="twitter:description" content={photo.description || `Premium ${photo.category} wildlife photography print available in multiple sizes and materials.`} />
        <meta name="twitter:image" content={photo.r2_url || photo.photo_url} />

        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": photo?.title,
          "description": photo?.description,
          "image": photo?.r2_url || photo?.photo_url,
          "brand": {
            "@type": "Brand",
            "name": "Great Wildlife Photos"
          },
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": "13.35",
            "highPrice": "129.00",
            "offerCount": "18",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Great Wildlife Photos"
            }
          },
          "category": photo?.category,
          "url": `https://greatwildlifephotos.com/photo/${photo?.slug}`
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate('/gallery')} className="my-4 mb-8">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to gallery
          </Button>

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
                <p className="text-sm font-medium text-primary mb-2">{photo.category}</p>
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
                  <MaterialMockup material={selectedMaterial} imageUrl={photo?.r2_url || photo?.photo_url} />
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