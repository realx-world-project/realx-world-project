"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use placeholder if no images
  const displayImages = images?.length > 0 
    ? images 
    : ["/placeholder.jpg"];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // Show max 10 thumbnails
  const thumbnails = displayImages.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={displayImages[currentIndex]}
          alt={`${title || "Property"} - Image ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {thumbnails.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md transition-all",
                "ring-2 ring-offset-2",
                index === currentIndex
                  ? "ring-primary"
                  : "ring-transparent hover:ring-muted-foreground/30"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}