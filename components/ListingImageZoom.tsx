"use client";

import { useEffect, useState } from "react";

type ListingImageZoomProps = {
  images?: string[];
  title?: string;
};

export default function ListingImageZoom({
  images = [],
  title = "Listing image",
}: ListingImageZoomProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeImage) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveImage(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeImage]);

  if (!Array.isArray(images) || images.length === 0) {
    return <div className="zl-no-image">No Image</div>;
  }

  return (
    <div className="zl-image-gallery">
      {/* Main Image */}
      <button
        type="button"
        onClick={() => setActiveImage(images[0])}
        className="zl-main-image-btn"
      >
        <img src={images[0]} alt={title} className="zl-main-image" />

        <span className="zl-zoom-label">
          <ZoomIcon />
          Click to zoom
        </span>
      </button>

      {/* Thumbnail Images */}
      {images.length > 1 && (
        <div className="zl-thumbs">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveImage(image)}
              className="zl-thumb-btn"
            >
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="zl-thumb-image"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Popup */}
      {activeImage && (
        <div className="zl-zoom-popup" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close popup"
            onClick={() => setActiveImage(null)}
            className="zl-zoom-backdrop"
          />

          <button
            type="button"
            aria-label="Close image preview"
            onClick={() => setActiveImage(null)}
            className="zl-zoom-close"
          >
            ×
          </button>

          <div className="zl-zoom-image-wrap">
            <img src={activeImage} alt={title} className="zl-zoom-image" />
          </div>
        </div>
      )}
    </div>
  );
}

function ZoomIcon() {
  return (
    <svg
      className="zl-zoom-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  );
}