"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  photos: string[];
  onClose: () => void;
};

export function PhotoGallery({ title, photos, onClose }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(photos.length - 1, i));
      const el = itemRefs.current[clamped];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
      setIndex(clamped);
    },
    [photos.length],
  );

  // Close on Escape; arrow keys to navigate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goTo(index + 1);
      else if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goTo, index]);

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Track which photo is centered as the user scrolls/swipes
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.idx);
        if (Number.isFinite(idx)) setIndex(idx);
      },
      { root: scroller, threshold: [0.5, 0.75, 1] },
    );
    for (const el of itemRefs.current) if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [photos.length]);

  if (photos.length === 0) return null;

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      className="fixed inset-0 z-50 flex flex-col bg-ink-900/95 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between gap-3 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="text-[11px] text-white/60">
            {index + 1} / {photos.length}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/20"
          aria-label="Close photos"
        >
          ✕
        </button>
      </div>

      <div
        className="relative flex-1"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={scrollerRef}
          className="h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        >
          <div className="flex h-full">
            {photos.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                data-idx={idx}
                className="flex h-full w-full shrink-0 snap-center items-center justify-center p-4 sm:p-8"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${title} photo ${idx + 1}`}
                  className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {hasPrev && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(index - 1);
            }}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
            aria-label="Previous photo"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        {hasNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(index + 1);
            }}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/25 sm:flex"
            aria-label="Next photo"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <div
          className="flex justify-center gap-1.5 pb-4"
          onClick={(e) => e.stopPropagation()}
        >
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
