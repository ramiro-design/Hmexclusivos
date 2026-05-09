import { MetadataRoute } from "next";
import { getAutos, getMarcas } from "@/lib/autos";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const autos = await getAutos();
  const marcas = await getMarcas();

  const autosUrls = autos.map((auto) => ({
    url: `https://hmexclusivos.com.ar/autos/${auto.id}`,
    lastModified: new Date(),
  }));

  const marcasUrls = marcas.map((marca: string) => ({
    url: `https://hmexclusivos.com.ar/marcas/${marca.toLowerCase()}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "https://hmexclusivos.com.ar",
      lastModified: new Date(),
    },

    ...autosUrls,
    ...marcasUrls,
  ];
}