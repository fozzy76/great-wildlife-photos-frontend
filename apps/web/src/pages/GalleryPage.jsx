import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { cn } from '@/lib/utils.js';
import SEO from '@/components/SEO.jsx';
import { DEFAULT_SEO_IMAGE, SITE_URL, baseGraph, breadcrumbSchema, webPageSchema } from '@/lib/seo.js';

const API_BASE = 'https://api.greatwildlifephotos.com';
const PAGE_SIZE = 24;

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Featured' },
  { value: 'title_asc', label: 'Name A-Z' }
];

const getPageFromParams = (searchParams) => {
  const page = parseInt(searchParams.get('page') || '1', 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const getSortFromParams = (searchParams) => {
  const sort = searchParams.get('sort') || 'newest';
  return sortOptions.some(option => option.value === sort) ? sort : 'newest';
};

const GalleryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || 'all';
  const searchFromUrl = searchParams.get('q') || '';
  const sortFromUrl = getSortFromParams(searchParams);
  const pageFromUrl = getPageFromParams(searchParams);

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [markupPct, setMarkupPct] = useState(50);
  const [minWholesale, setMinWholesale] = useState(0);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    limit: PAGE_SIZE,
    offset: 0,
    total: 0,
    returned: 0
  });

  const totalPhotos = pagination.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalPhotos / PAGE_SIZE));
  const startPhoto = totalPhotos === 0 ? 0 : pagination.offset + 1;
  const endPhoto = Math.min(pagination.offset + photos.length, totalPhotos);
  const hasPreviousPage = pageFromUrl > 1;
  const hasNextPage = pageFromUrl < totalPages;

  const buildGalleryPath = (overrides = {}) => {
    const getValue = (key, fallback) => (
      Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : fallback
    );
    const nextCategory = getValue('category', categoryFromUrl);
    const nextSearch = getValue('q', searchFromUrl);
    const nextSort = getValue('sort', sortFromUrl);
    const nextPage = getValue('page', pageFromUrl);
    const params = new URLSearchParams();

    if (nextCategory && nextCategory !== 'all') {
      params.set('category', nextCategory);
    }

    if (nextSearch) {
      params.set('q', nextSearch);
    }

    if (nextSort && nextSort !== 'newest') {
      params.set('sort', nextSort);
    }

    if (nextPage && nextPage > 1) {
      params.set('page', String(nextPage));
    }

    const query = params.toString();
    return query ? `/gallery?${query}` : '/gallery';
  };

  const setGalleryParams = (overrides) => {
    const path = buildGalleryPath(overrides);
    const query = path.includes('?') ? path.split('?')[1] : '';
    setSearchParams(new URLSearchParams(query));
  };

  const pageLinks = useMemo(() => {
    const windowSize = 5;
    const halfWindow = Math.floor(windowSize / 2);
    let start = Math.max(1, pageFromUrl - halfWindow);
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [pageFromUrl, totalPages]);

  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const ts = Date.now();
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
        const offset = (pageFromUrl - 1) * PAGE_SIZE;
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
          t: String(Date.now())
        });

        if (categoryFromUrl !== 'all') {
          params.set('category', categoryFromUrl);
        }

        if (searchFromUrl) {
          params.set('q', searchFromUrl);
        }

        if (sortFromUrl !== 'newest') {
          params.set('sort', sortFromUrl);
        }

        const response = await fetch(API_BASE + `/products?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setPhotos(data.products || []);
          setPagination({
            limit: data.pagination?.limit || PAGE_SIZE,
            offset: data.pagination?.offset || offset,
            total: data.pagination?.total ?? data.products?.length ?? 0,
            returned: data.pagination?.returned ?? data.products?.length ?? 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [categoryFromUrl, pageFromUrl, searchFromUrl, sortFromUrl]);

  const getFromPrice = (photo) => {
    const markup = markupPct / 100;
    return (minWholesale * (1 + markup) + parseFloat(photo.base_price)).toFixed(2);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setGalleryParams({ q: searchInput.trim() || null, page: 1 });
  };

  const handleSortChange = (sort) => {
    setGalleryParams({ sort, page: 1 });
  };

  const clearSearch = () => {
    setSearchInput('');
    setGalleryParams({ q: null, page: 1 });
  };

  const canonicalPath = searchFromUrl ? buildGalleryPath({ q: null, page: 1 }) : buildGalleryPath();
  const previousUrl = hasPreviousPage ? SITE_URL + buildGalleryPath({ page: pageFromUrl - 1 }) : null;
  const nextUrl = hasNextPage ? SITE_URL + buildGalleryPath({ page: pageFromUrl + 1 }) : null;
  const pageTitleParts = [
    categoryFromUrl !== 'all' ? `${categoryFromUrl} Wildlife Photography Prints` : 'Wildlife Photography Prints Gallery',
    pageFromUrl > 1 ? `Page ${pageFromUrl}` : null,
    'Great Wildlife Photos'
  ].filter(Boolean);
  const pageTitle = pageTitleParts.join(' | ');
  const pageDescription = categoryFromUrl !== 'all'
    ? `Browse ${categoryFromUrl} wildlife photography prints by Lynn Starnes. Shop museum-quality canvas, metal, and acrylic fine art prints.`
    : 'Browse award-winning North American wildlife photography prints by Lynn Starnes. Filter fine art prints by subject and shop canvas, metal, and acrylic options.';

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        path={canonicalPath}
        image={DEFAULT_SEO_IMAGE}
        robots={searchFromUrl ? 'noindex,follow' : 'index,follow'}
        schema={[
          ...baseGraph(),
          webPageSchema({
            path: canonicalPath,
            name: pageTitle,
            description: pageDescription,
            type: 'CollectionPage',
            image: DEFAULT_SEO_IMAGE
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Gallery', path: canonicalPath }
          ])
        ]}
      >
        {previousUrl && <link rel="prev" href={previousUrl} />}
        {nextUrl && <link rel="next" href={nextUrl} />}
      </SEO>

      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Photo gallery</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Lynn Starnes has photographed North American wildlife for over three decades. Browse award-winning images available as premium fine art prints on canvas, metal, and acrylic.
            </p>
          </div>

          <div className="mb-8 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search photos by animal, place, or subject"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="h-10 pl-10 pr-10 bg-white text-gray-900 placeholder:text-gray-500"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button type="submit" className="h-10">Search</Button>
              </form>

              <Select value={sortFromUrl} onValueChange={handleSortChange}>
                <SelectTrigger className="h-10 bg-white text-gray-900">
                  <SelectValue placeholder="Sort photos" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['all', ...categories].map(category => {
                const isActive = categoryFromUrl === category;
                const label = category === 'all' ? 'All' : category;

                return (
                  <Link
                    key={category}
                    to={buildGalleryPath({ category, page: 1 })}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:border-primary hover:text-primary'
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mb-5 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              {loading
                ? 'Loading gallery...'
                : totalPhotos > 0
                  ? `Showing ${startPhoto}-${endPhoto} of ${totalPhotos} photos`
                  : 'No photos found'}
            </p>
            {(categoryFromUrl !== 'all' || searchFromUrl || sortFromUrl !== 'newest') && (
              <Link to="/gallery" className="font-medium text-primary hover:underline">
                Reset gallery
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }, (_, index) => (
                <Skeleton key={index} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/30 px-6 py-20 text-center">
              <p className="text-lg text-muted-foreground">No photos found matching your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map(photo => (
                  <Link
                    key={photo.id}
                    to={`/photo/${photo.slug}`}
                    className="group block overflow-hidden rounded-lg bg-card shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-80">
                      <img
                        src={photo.r2_url || photo.photo_url}
                        alt={`${photo.title} - ${photo.category} wildlife photography print`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(event) => { event.target.src = 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
                        <h3 className="mb-2 text-xl font-semibold text-white">{photo.title}</h3>
                        <p className="mb-2 text-sm text-gray-300">{photo.category}</p>
                        <p className="text-lg font-semibold text-primary">From ${getFromPrice(photo)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <nav className="mt-10 flex flex-col items-center gap-4" aria-label="Gallery pagination">
                {hasNextPage && (
                  <Button asChild size="lg" className="px-8">
                    <Link to={buildGalleryPath({ page: pageFromUrl + 1 })}>
                      View more photos
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Link
                      to={hasPreviousPage ? buildGalleryPath({ page: pageFromUrl - 1 }) : buildGalleryPath({ page: 1 })}
                      className={cn(
                        'inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary',
                        !hasPreviousPage && 'pointer-events-none opacity-40'
                      )}
                      aria-disabled={!hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Link>

                    {pageLinks.map(page => (
                      <Link
                        key={page}
                        to={buildGalleryPath({ page })}
                        className={cn(
                          'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors',
                          page === pageFromUrl
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary hover:text-primary'
                        )}
                        aria-current={page === pageFromUrl ? 'page' : undefined}
                      >
                        {page}
                      </Link>
                    ))}

                    <Link
                      to={hasNextPage ? buildGalleryPath({ page: pageFromUrl + 1 }) : buildGalleryPath({ page: totalPages })}
                      className={cn(
                        'inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary',
                        !hasNextPage && 'pointer-events-none opacity-40'
                      )}
                      aria-disabled={!hasNextPage}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </nav>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GalleryPage;
