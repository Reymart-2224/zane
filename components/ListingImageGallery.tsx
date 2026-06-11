"use client";

import { useState } from "react";

type ListingImageGalleryProps = {
  images: string[];
  title?: string;
};

export default function ListingImageGallery({
  images,
  title,
}: ListingImageGalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!images.length) {
    return (
      <div className="flex h-[320px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-400 shadow-sm md:h-[470px]">
        No Image
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setActiveImage(images[0])}
          className="group block w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <img
            src={images[0]}
            alt={title || "Listing image"}
            className="h-[320px] w-full object-cover object-center transition duration-500 group-hover:scale-105 md:h-[470px]"
          />
        </button>

        {images.length > 1 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImage(image)}
                className="group block overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="h-24 w-full object-cover object-center transition duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 py-6"
          onClick={() => setActiveImage(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-[#111827]"
          >
            ×
          </button>

          <img
            src={activeImage}
            alt={title || "Preview image"}
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}