import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sprout It",
    short_name: "Sprout It",
    description: "Every expert was once a sprout. Learn anything, one tiny step at a time.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6faf8",
    theme_color: "#2fbf71",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
