import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://hmexclusivos.com.ar",
      lastModified: new Date(),
    },
    {
      url: "https://hmexclusivos.com.ar/login",
      lastModified: new Date(),
    },
  ];
}