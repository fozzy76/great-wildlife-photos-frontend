import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const API_BASE = 'https://api.greatwildlifephotos.com';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/products/categories/list`);
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category or sort changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE}/products?limit=50&offset=0`;

        if (selectedCategory !== 'all') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
          let items = data.products;

          // Client-side sorting
          if (sortOrder === 'price_asc') {
            items.sort((a, b) => (a.base_price || 0) - (b.base_price || 0));
          } else if (sortOrder === 'price_desc') {
            items.sort((a, b) => (b.base_price || 0) - (a.base_price || 0));
          } else if (sortOrder === 'newest') {
            items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }

          setProducts(items);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, sortOrder]);

  // Generate slug from title
  const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link> <span className="mx-2">/</span> Shop
      </nav>

      <h1 className="text-4xl font-serif font-bold mb-8 text-balance">All Prints</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="rounded-full"
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="w-48">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading prints...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
          <p className="text-xl text-muted-foreground mb-4">No prints found matching your criteria.</p>
          <Button onClick={() => { setSelectedCategory('all'); setSortOrder('newest'); }}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => {
            const slug = generateSlug(product.title);
            const imageUrl = product.photo_url || '/placeholder.jpg';
            const price = product.base_price || 79.99;

            return (
              <Link key={product.id} to={`/shop/${slug}`} className="group block">
                <div className="aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-muted relative">
                  <img
                    src={imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-black px-6 py-2 rounded-full text-sm font-medium">View Print</span>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <p className="font-medium">From ${price.toFixed(2)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopPage;