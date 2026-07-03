import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import AsyncProductImage from '@/components/AsyncProductImage.jsx';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO.jsx';

const CollectionPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all visible collections
      const collRecords = await pb.collection('collections').getFullList({
        filter: 'isVisible=true',
        sort: '-created', // Sort by creation date as requested
        $autoCancel: false
      });

      // 2. For each collection, count products and get a preview image
      const collectionsData = await Promise.all(
        collRecords.map(async (col) => {
          const prodData = await pb.collection('products').getList(1, 1, {
            filter: `collection="${col.id}" && isVisible=true`,
            sort: '-created',
            $autoCancel: false
          });
          
          return {
            id: col.id,
            name: col.name,
            slug: col.slug,
            description: col.description,
            count: prodData.totalItems,
            // Use collection's featured image if available, otherwise fallback to first product's image
            previewImageId: col.featured_image_id || col.heroImage || (prodData.items.length > 0 ? prodData.items[0].imageFileId : null)
          };
        })
      );

      setCollections(collectionsData);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <SEO title="Collections | Great Wildlife Photos" description="Curated wildlife photography print collections by Lynn Starnes." path="/collections" />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Curating collections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <SEO title="Collections | Great Wildlife Photos" description="Curated wildlife photography print collections by Lynn Starnes." path="/collections" robots="noindex,follow" />
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-3xl font-serif font-bold mb-2">Unable to Load Collections</h1>
        <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
        <Button onClick={fetchCollections} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEO title="Collections | Great Wildlife Photos" description="Explore curated fine art wildlife photography collections by Lynn Starnes." path="/collections" />

      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-balance tracking-tight mb-6">
          Curated Collections
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Discover our finest wildlife photography, thoughtfully organized by species, environment, and thematic series. Find the perfect piece to transform your space.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border border-border/50">
          <p className="text-xl text-foreground font-medium mb-2">No collections available yet.</p>
          <p className="text-muted-foreground">We are currently curating new series. Please check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {collections.map(col => (
            <Link key={col.id} to={`/collections/${col.slug}`} className="group flex flex-col h-full">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-muted relative shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
                {col.previewImageId ? (
                  <AsyncProductImage
                    fileId={col.previewImageId}
                    alt={col.name}
                    useWatermark
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/40 text-muted-foreground">
                    <span className="text-sm font-medium tracking-wide uppercase">Coming Soon</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-6 left-0 right-0 flex justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                  <span className="bg-background/95 backdrop-blur-sm text-foreground px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide shadow-lg">
                    Explore Series
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col flex-grow px-2">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {col.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground tabular-nums tracking-wide shrink-0 ml-4">
                    {col.count} {col.count === 1 ? 'Print' : 'Prints'}
                  </span>
                </div>
                {col.description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mt-auto">
                    {col.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default CollectionPage;
