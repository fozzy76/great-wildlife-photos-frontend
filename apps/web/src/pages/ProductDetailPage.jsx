import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useCart } from '@/contexts/CartContext.jsx';
import AsyncProductImage from '@/components/AsyncProductImage.jsx';

const SIZE_PRICING = {
  '8x10': 0,
  '11x14': 20,
  '16x20': 40,
  '20x30': 60,
  '24x36': 90
};

const TYPE_PRICING = {
  'Fine Art Paper': 0,
  'Canvas': 30,
  'Metal Print': 50
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const record = await pb.collection('products').getFirstListItem(`slug="${slug}"`, {
          expand: 'collection',
          $autoCancel: false
        });
        setProduct(record);
        if (record.available_sizes?.length) setSelectedSize(record.available_sizes[0]);
        if (record.print_types?.length) setSelectedType(record.print_types[0]);

        if (record.collection) {
          const related = await pb.collection('products').getList(1, 3, {
            filter: `collection="${record.collection}" && id!="${record.id}"`,
            $autoCancel: false
          });
          setRelatedProducts(related.items);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchProduct();
  }, [slug]);

  if (!product) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading details...</div>;

  const currentPrice = product.base_price + (SIZE_PRICING[selectedSize] || 0) + (TYPE_PRICING[selectedType] || 0);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedType, currentPrice, quantity);
    toast.success('Added to cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link> <span className="mx-2">/</span> 
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link> <span className="mx-2">/</span> 
        {product.expand?.collection && (
          <><Link to={`/collections/${product.expand.collection.slug}`} className="hover:text-primary transition-colors">{product.expand.collection.name}</Link> <span className="mx-2">/</span></>
        )}
        <span className="text-foreground">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
        <div className="lg:col-span-7">
          <div className="rounded-2xl overflow-hidden bg-muted sticky top-24 relative min-h-[400px]">
            <AsyncProductImage 
              fileId={product.imageFileId} 
              alt={product.title} 
              useWatermark
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-sm font-medium text-primary mb-2 tracking-wide uppercase">{product.expand?.collection?.name || 'Art Print'}</p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-balance leading-tight">{product.title}</h1>
            <p className="text-3xl font-medium">${currentPrice}</p>
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-prose">
            {product.description || 'A stunning fine art wildlife print captured by Lynn Starnes. Perfect for bringing the beauty of nature into your home or office.'}
          </p>

          <div className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {product.available_sizes?.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}" {SIZE_PRICING[size] > 0 ? `(+$${SIZE_PRICING[size]})` : '(Base Price)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Print Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select a print type" />
                </SelectTrigger>
                <SelectContent>
                  {product.print_types?.map(type => (
                    <SelectItem key={type} value={type}>
                      {type} {TYPE_PRICING[type] > 0 ? `(+$${TYPE_PRICING[type]})` : '(Base Price)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center w-32 border border-border rounded-lg overflow-hidden h-12">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full hover:bg-muted transition-colors">-</button>
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="border-0 text-center focus-visible:ring-0 rounded-none h-full"
                />
                <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="px-4 h-full hover:bg-muted transition-colors">+</button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Total Price:</span>
                <span className="text-2xl font-bold">${(currentPrice * quantity).toFixed(2)}</span>
              </div>
              <Button onClick={handleAddToCart} size="lg" className="w-full h-14 text-lg transition-transform active:scale-[0.98]">
                Add to Cart
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2 pt-2">
            <p>Free shipping on orders over $200.</p>
            <p>© Lynn Starnes. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Print Quality Details */}
      <div className="mb-24 bg-secondary text-secondary-foreground rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-serif font-bold mb-8 text-center text-balance">Print Quality & Materials</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-2">Fine Art Paper</h3>
            <p className="text-sm opacity-90 leading-relaxed">Archival-quality, acid-free, 300gsm premium paper. Museum-grade longevity with a subtle texture that enhances depth.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Canvas</h3>
            <p className="text-sm opacity-90 leading-relaxed">Cotton-poly blend canvas with gallery wrap mounting. Vibrant, fade-resistant colors ready to hang without a frame.</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Metal Print</h3>
            <p className="text-sm opacity-90 leading-relaxed">Aluminum Dibond with UV-resistant coating. Stunning color depth, modern frameless look, and extreme durability.</p>
          </div>
        </div>
      </div>

      {/* Visual Size Guide */}
      <div className="mb-24">
        <h2 className="text-2xl font-serif font-bold mb-8 text-center">Size Guide</h2>
        <div className="aspect-[21/9] bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop" alt="Living room interior size reference" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center gap-4 md:gap-8 p-8">
            <div className="bg-white/80 backdrop-blur-sm border border-black/10 shadow-lg flex items-center justify-center text-xs font-bold" style={{ width: '10%', height: '12.5%' }}>8x10</div>
            <div className="bg-white/80 backdrop-blur-sm border border-black/10 shadow-lg flex items-center justify-center text-xs font-bold" style={{ width: '13.75%', height: '17.5%' }}>11x14</div>
            <div className="bg-white/80 backdrop-blur-sm border border-black/10 shadow-lg flex items-center justify-center text-sm font-bold" style={{ width: '20%', height: '25%' }}>16x20</div>
            <div className="bg-white/80 backdrop-blur-sm border border-black/10 shadow-lg flex items-center justify-center text-base font-bold" style={{ width: '25%', height: '37.5%' }}>20x30</div>
            <div className="bg-white/80 backdrop-blur-sm border border-black/10 shadow-lg flex items-center justify-center text-lg font-bold" style={{ width: '30%', height: '45%' }}>24x36</div>
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-serif font-bold mb-8 text-balance">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map(prod => (
              <Link key={prod.id} to={`/shop/${prod.slug}`} className="group block">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-muted relative">
                  <AsyncProductImage 
                    fileId={prod.imageFileId} 
                    alt={prod.title} 
                    useWatermark
                    className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium">View Print</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{prod.title}</h3>
                <p className="text-muted-foreground">From ${prod.base_price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;