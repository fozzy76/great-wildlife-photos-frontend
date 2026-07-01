import React from 'react';
import { cn } from '@/lib/utils';

const WatermarkImage = ({ src, alt, className, imageClassName }) => {
  return (
    <div 
      className={cn("relative overflow-hidden select-none", className)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img 
        src={src} 
        alt={alt} 
        className={cn("w-full h-full object-cover pointer-events-none", imageClassName)} 
        draggable="false"
      />
      <span className="absolute bottom-4 right-4 text-white/60 font-serif text-sm md:text-base font-medium tracking-wide pointer-events-none drop-shadow-md">
        © Lynn Starnes
      </span>
    </div>
  );
};

export default WatermarkImage;