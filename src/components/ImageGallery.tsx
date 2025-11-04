'use client';

import { useState } from 'react';
import { OptimizedImage } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  maxDisplay?: number;
  showZoom?: boolean;
}

export function ImageGallery({
  images,
  alt,
  className,
  maxDisplay = 4,
  showZoom = true,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-gray-100 rounded-lg', className)}>
        <div className="text-center text-gray-400 py-8">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const displayImages = images.slice(0, maxDisplay);
  const hasMore = images.length > maxDisplay;

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-2', className)}>
        {displayImages.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100"
            onClick={() => openModal(index)}
          >
            <OptimizedImage
              src={image}
              alt={`${alt} ${index + 1}`}
              className="w-full h-32 object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            {showZoom && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>
        ))}

        {hasMore && (
          <div className="relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
            <div
              className="w-full h-32 bg-gray-200 flex items-center justify-center text-gray-600 font-medium"
              onClick={() => openModal(maxDisplay)}
            >
              +{images.length - maxDisplay} more
            </div>
          </div>
        )}
      </div>

      {/* Modal for full-size viewing */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Main image */}
            <div className="relative aspect-video bg-black">
              <OptimizedImage
                src={images[selectedIndex]}
                alt={`${alt} ${selectedIndex + 1}`}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-2">
                <div className="flex justify-center space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      className={cn(
                        'flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden',
                        selectedIndex === index
                          ? 'border-white'
                          : 'border-gray-500 hover:border-gray-300'
                      )}
                      onClick={() => setSelectedIndex(index)}
                    >
                      <OptimizedImage
                        src={image}
                        alt={`${alt} ${index + 1} thumbnail`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image counter */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}