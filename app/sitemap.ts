import { MetadataRoute } from "next";
import axiosReq from "@/config/axios";

const staticUrls = [
  "/",
  "/public/search",
  "/faq/privacidad",
  "/faq/terminos",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sacaturno.com.ar";

  const staticEntries: MetadataRoute.Sitemap = staticUrls.map((url) => ({
    url: `${baseUrl}${url}`,
    lastModified: new Date("2025-01-01"),
  }));

  try {
    const { data } = await axiosReq.get<{ slug: string; updatedAt: string }[]>(
      "/business/sitemap"
    );
    const businessEntries: MetadataRoute.Sitemap = data.map((b) => ({
      url: `${baseUrl}/${b.slug}`,
      lastModified: new Date(b.updatedAt),
    }));
    return [...staticEntries, ...businessEntries];
  } catch {
    return staticEntries;
  }
}
