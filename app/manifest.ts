import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Angkor Go",
    short_name: "Angkor Go",
    description: "Modern Siem Reap travel app with smart place filters and full-screen map pages.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#dc2626",
    lang: "en",
    icons: [
      {
        src: "/icon-travel.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
