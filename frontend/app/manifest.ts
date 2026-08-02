import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CupomForm",
    short_name: "CupomForm",
    description: "Responda e ganhe seu cupom exclusivo para o comércio local.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0a1f",
    theme_color: "#0b0a1f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
