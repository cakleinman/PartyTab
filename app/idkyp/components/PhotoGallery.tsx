"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  title: string;
  photos: string[];
  onClose: () => void;
};

export function PhotoGallery({ title, photos, onClose }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Intercept the back gesture / button. We push a no-op history entry on
  // mount, so the next "back" pops it (firing popstate) and we close instead
  // of navigating off /idkyp.
  useEffect(() => {
    const stateMarker = { __idkypGallery: true };
    window.history.pushState(stateMarker, "");
    const onPop = () => onClose();
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      // If we were closed via Escape / X-button (not via back), pop our marker
      // so we don't leave history junk behind.
      if (window.history.state && (window.history.state as { __idkypGallery?: boolean }).__idkypGallery) {
        window.history.back();
      }
    };
  }, [onClose]);

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
  if (!mounted) return null;

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  // Portaled to document.body so we escape any transformed ancestor
  // (animate-fade-in-up on EliminateScreen keeps a transform: translateY(0)
  // final state, which creates a containing block — fixed inset-0 would
  // size to that ancestor instead of the viewport).
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      className="fixed inset-0 z-[1000] flex flex-col bg-black"
      style={{ height: "100dvh" }}
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3"
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 active:scale-95"
          aria-label="Close photos"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="relative flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
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
                className="flex h-full w-full shrink-0 snap-center items-center justify-center p-2 sm:p-6"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${title} photo ${idx + 1}`}
                  className="max-h-full max-w-full rounded-xl object-contain"
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
          className="flex justify-center gap-1.5 pt-3 pb-[max(env(safe-area-inset-bottom),1rem)]"
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
    </div>,
    document.body,
  );
}
