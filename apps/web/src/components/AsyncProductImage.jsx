import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import WatermarkImage from '@/components/WatermarkImage.jsx';
import apiServerClient from '@/lib/apiServerClient';
import { Image as ImageIcon } from 'lucide-react';

const AsyncProductImage = ({ fileId, alt, className = '', useWatermark = false }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileId) {
      setImgSrc(null);
      setLoading(false);
      return;
    }

    let objectUrl = null;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await apiServerClient.fetch(`/admin/products/image/${fileId}`);
        if (!res.ok) throw new Error('Failed to load image');
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
      } catch (err) {
        console.error('Image fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId]);

  if (loading) {
    return <Skeleton className={`w-full h-full min-h-[4rem] min-w-[4rem] ${className}`} />;
  }

  if (!fileId || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted text-muted-foreground w-full h-full min-h-[4rem] min-w-[4rem] ${className}`}>
        <ImageIcon className="h-6 w-6 mb-1 opacity-20" />
        <span className="text-[10px] text-center px-1 leading-tight">{!fileId ? 'No image' : 'Load failed'}</span>
      </div>
    );
  }

  if (useWatermark) {
    return <WatermarkImage src={imgSrc} alt={alt} className={className} />;
  }

  return <img src={imgSrc} alt={alt} className={`object-cover ${className}`} />;
};

export default AsyncProductImage;