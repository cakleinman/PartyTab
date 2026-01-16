import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PartyTab",
    short_name: "PartyTab",
    description: "Split expenses with friends, settle before you leave.",
    start_url: "/tabs",
    display: "standalone",
    background_color: "#fbf7f0",
    theme_color: "#1b1a18",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png?v=3",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png?v=3",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png?v=3",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
