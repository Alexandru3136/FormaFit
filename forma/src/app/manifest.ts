import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f7f7f2",
    categories: ["health", "fitness", "lifestyle"],
    description: "Mancare, sala si progres cu un coach AI practic.",
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/icon-192.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icon-512.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    name: "Forma",
    orientation: "portrait",
    short_name: "Forma",
    start_url: "/dashboard",
    theme_color: "#123f31",
  };
}
