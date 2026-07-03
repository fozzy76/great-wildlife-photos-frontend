import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import AsyncProductImage from '@/components/AsyncProductImage.jsx';
import { Loader2, AlertCircle, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO.jsx';

const CollectionDetailPage = () => {
  const { collectionSlug } = useParams();
  const [products, setProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollectionDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch collection by slug
      const collRecord = await pb.collection('collections').getFirstListItem(`slug="${collectionSlug}" && isVisible=true`, { 
        $autoCancel: false 
      });
      setCollection(collRecord);

      // 2. Fetch products in that collection using the collection ID
      const prodRecords = await pb.collection('products').getFullList({
        filter: `collection="${collRecord.id}" && isVisible=true`,
        expand: 'collection',
        sort: '-created',
        $autoCancel: false
      });

      setProducts(prodRecords);
    } catch (err) {
      console.error('Error fetching collection details:', err);
      setError('The collection you are looking for could not be found or is currently unavailable.');
    } finally {
      setLoading(false);
    }
  }, [collectionSlug]);

  useEffect(() => {
    fetchCollectionDetails();
  }, [fetchCollectionDetails]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <SEO title="Loading Collection | Great Wildlife Photos" description="Loading curated wildlife photography collection." path={`/collections/${collectionSlug}`} robots="noindex,follow" />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading collection...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <SEO title="Collection Not Found | Great Wildlife Photos" description="This wildlife photography collection could not be found." path={`/collections/${collectionSlug}`} robots="noindex,follow" />
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-3xl font-serif font-bold mb-4 tracking-tight">Collection Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">
          {error || "This collection doesn't exist or has been removed."}
        </p>
        <div className="flex gap-4">
          <Button onClick={fetchCollectionDetails} variant="outline">
            Retry
          </Button>
          <Button asChild variant="default">
            <Link to="/collections">View All Collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEO
        title={`${collection.name} | Great Wildlife Photos`}
        description={collection.description || `Explore fine art wildlife prints from the ${collection.name} collection.`}
        path={`/collections/${collectionSlug}`}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-10">
        <ol className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-primary transition-colors flex items-center">
              <Home className="h-4 w-4 mr-1" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
          <li><ChevronRight className="h-4 w-4 text-muted-foreground/50" /></li>
          <li>
            <Link to="/collections" className="hover:text-primary transition-colors">
              Collections
            </Link>
          </li>
          <li><ChevronRight className="h-4 w-4 text-muted-foreground/50" /></li>
          <li className="text-foreground" aria-current="page">
            {collection.name}
          </li>
        </ol>
      </nav>

      {/* Collection Header */}
      <div className="mb-16 max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-balance mb-6 tracking-tight">
          {collection.name}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {collection.description || `Explore our curated fine art wildlife prints from the ${collection.name} series.`}
        </p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-muted/20 rounded-3xl border border-border/50 text-center px-4">
          <p className="text-2xl font-serif font-medium text-foreground mb-3">No products in this collection yet.</p>
          <p className="text-muted-foreground">Check back soon for new additions to the {collection.name} series.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {products.map(product => (
            <Link key={product.id} to={`/shop/${product.slug}`} className="group flex flex-col h-full">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-5 bg-muted relative shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
                <AsyncProductImage
                  fileId={product.imageFileId}
                  alt={product.title}
                  useWatermark
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="flex flex-col flex-grow px-1">
                <div className="flex justify-between items-start gap-4 mb-1">
                  <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {product.title}
                  </h3>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-foreground tabular-nums">${product.base_price}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground tracking-wide mt-auto pt-2">
                  {collection.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default CollectionDetailPage;
