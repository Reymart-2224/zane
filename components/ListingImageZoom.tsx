"use client";

import { useEffect, useState } from "react";

type ListingImageZoomProps = {
  images: string[];
  title?: string;
};

export default function ListingImageZoom({
  images,
  title = "Listing image",
}: ListingImageZoomProps) {
  const cleanImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  if (!cleanImages.length) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm text-gray-400 shadow-sm">
        No images available
      </div>
    );
  }

  const activeImage = cleanImages[activeIndex];

  const goPrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? cleanImages.length - 1 : prev - 1
    );
  };

  const goNext = () => {
    setActiveIndex((prev) =>
      prev === cleanImages.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    if (!zoomOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoomOpen(false);
      }

      if (e.key === "ArrowLeft") {
        goPrev();
      }

      if (e.key === "ArrowRight") {
        goNext();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomOpen, cleanImages.length]);

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <img
          src={activeImage}
          alt={title}
          className="h-[320px] w-full cursor-zoom-in object-cover sm:h-[460px] md:h-[560px]"
          onClick={() => setZoomOpen(true)}
        />

        <button
          type="button"
          onClick={() => setZoomOpen(true)}
          className="absolute right-4 top-4 rounded-full bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/70"
        >
          Zoom
        </button>

        {cleanImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl font-bold text-white backdrop-blur transition hover:bg-black/65"
              aria-label="Previous image"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl font-bold text-white backdrop-blur transition hover:bg-black/65"
              aria-label="Next image"
            >
              ›
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              {activeIndex + 1} / {cleanImages.length}
            </div>
          </>
        )}
      </div>

      {cleanImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {cleanImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition ${
                activeIndex === index
                  ? "border-[#296589] ring-2 ring-[#296589]/30"
                  : "border-gray-200 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {zoomOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl font-bold text-white backdrop-blur transition hover:bg-white/25"
            aria-label="Close zoom"
          >
            ×
          </button>

          {cleanImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-3xl font-bold text-white backdrop-blur transition hover:bg-white/25"
                aria-label="Previous zoom image"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-3xl font-bold text-white backdrop-blur transition hover:bg-white/25"
                aria-label="Next zoom image"
              >
                ›
              </button>
            </>
          )}

          <img
            src={activeImage}
            alt={title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
          />

          {cleanImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              {activeIndex + 1} / {cleanImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}