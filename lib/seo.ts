import type { Metadata } from "next";

/**
 * Shared OG image config — import into every page's metadata to ensure
 * social sharing previews work on subpages (Next.js doesn't deep-merge openGraph).
 */
export const OG_IMAGE: NonNullable<NonNullable<Metadata["openGraph"]>["images"]> = [
  {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "PartyTab - Free Bill Splitting App",
  },
];

export const TWITTER_IMAGE = "/opengraph-image";
