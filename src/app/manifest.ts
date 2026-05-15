import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gotera — ጎተራ",
    short_name: "Gotera",
    description: "B2B agricultural supply connecting Ethiopian farmers with bulk buyers.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0e8",
    theme_color: "#d4a017",
    icons: [{ src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" }],
  };
}
