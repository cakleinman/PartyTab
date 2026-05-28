"use client";

import { useEffect } from "react";

type Props = {
  title: string;
  photos: string[];
  onClose: () => void;
};

export function PhotoGallery({ title, photos, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  if (photos.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      className="fixed inset-0 z-50 flex flex-col bg-ink-900/95 backdrop-blur"
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-4">
        <p className="truncate text-sm font-medium text-white">{title}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
          aria-label="Close photos"
        >
          ✕
        </button>
      </div>

      <div
        className="flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full">
          {photos.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="flex h-full w-full shrink-0 snap-center items-center justify-center p-4"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${title} photo ${idx + 1}`}
                className="max-h-full max-w-full rounded-2xl object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <p className="px-4 pb-4 text-center text-xs text-white/60">
        {photos.length} {photos.length === 1 ? "photo" : "photos"} · swipe / tap outside to close
      </p>
    </div>
  );
}
