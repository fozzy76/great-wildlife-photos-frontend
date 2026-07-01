import React, { useEffect, useRef } from 'react';

const MaterialMockup = ({ material, imageUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = `https://api.greatwildlifephotos.com/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate aspect ratio to fit within canvas with padding
      const padding = 60;
      const maxWidth = canvas.width - padding * 2;
      const maxHeight = canvas.height - padding * 2;
      const imgRatio = img.width / img.height;
      const canvasRatio = maxWidth / maxHeight;
      
      let drawWidth, drawHeight;
      if (imgRatio > canvasRatio) {
        drawWidth = maxWidth;
        drawHeight = maxWidth / imgRatio;
      } else {
        drawHeight = maxHeight;
        drawWidth = maxHeight * imgRatio;
      }
      
      const x = (canvas.width - drawWidth) / 2;
      const y = (canvas.height - drawHeight) / 2;

      // Draw base shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = material === 'acrylic' ? 30 : 20;
      ctx.shadowOffsetX = material === 'acrylic' ? 15 : 8;
      ctx.shadowOffsetY = material === 'acrylic' ? 20 : 12;
      
      // Draw image
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
      
      // Reset shadow for overlays
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Apply material effects
      if (material.toLowerCase() === 'canvas') {
        // Canvas wrap edge (left side)
        ctx.fillStyle = '#d4d4d4';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 15, y + 10);
        ctx.lineTo(x - 15, y + drawHeight + 10);
        ctx.lineTo(x, y + drawHeight);
        ctx.fill();
        
        // Canvas wrap edge (bottom side)
        ctx.fillStyle = '#a3a3a3';
        ctx.beginPath();
        ctx.moveTo(x - 15, y + drawHeight + 10);
        ctx.lineTo(x, y + drawHeight);
        ctx.lineTo(x + drawWidth, y + drawHeight);
        ctx.lineTo(x + drawWidth - 15, y + drawHeight + 10);
        ctx.fill();
        
        // Canvas texture overlay (subtle noise/grid)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        for(let i = 0; i < drawWidth; i += 3) {
          ctx.fillRect(x + i, y, 1, drawHeight);
        }
        for(let j = 0; j < drawHeight; j += 3) {
          ctx.fillRect(x, y + j, drawWidth, 1);
        }
      } else if (material.toLowerCase() === 'metal') {
        // Metal sheen
        const gradient = ctx.createLinearGradient(x, y, x + drawWidth, y + drawHeight);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, drawWidth, drawHeight);
        
        // Sharp metallic edge
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, drawWidth, drawHeight);
      } else if (material.toLowerCase() === 'acrylic') {
        // Acrylic thick edge (right side)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(x + drawWidth, y);
        ctx.lineTo(x + drawWidth + 10, y - 10);
        ctx.lineTo(x + drawWidth + 10, y + drawHeight - 10);
        ctx.lineTo(x + drawWidth, y + drawHeight);
        ctx.fill();
        
        // Acrylic top edge
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y - 10);
        ctx.lineTo(x + drawWidth + 10, y - 10);
        ctx.lineTo(x + drawWidth, y);
        ctx.fill();

        // Glossy reflection
        const gloss = ctx.createLinearGradient(x, y, x + drawWidth * 0.6, y + drawHeight);
        gloss.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        gloss.addColorStop(0.25, 'rgba(255, 255, 255, 0.1)');
        gloss.addColorStop(0.26, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gloss;
        ctx.fillRect(x, y, drawWidth, drawHeight);
      }
    };
  }, [material, imageUrl]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-muted/30 border border-border flex flex-col items-center justify-center p-4 mt-4">
      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md border border-border px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider z-10 shadow-sm">
        {material} Preview
      </div>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={480} 
        className="w-full h-auto max-w-[600px]"
      />
    </div>
  );
};

export default MaterialMockup;