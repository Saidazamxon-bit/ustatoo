import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UstaTop — barcha xizmatlar bir joyda",
    short_name: "UstaTop",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6F1",
    theme_color: "#F47721",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
