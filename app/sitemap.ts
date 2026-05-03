import { MetadataRoute } from "next";
import axiosReq from "@/config/axios";

type ChangeFreq = MetadataRoute.Sitemap[0]["changeFrequency"];

const staticPages: Array<{ url: string; changeFrequency: ChangeFreq; priority: number }> = [
  { url: "/", changeFrequency: "weekly", priority: 1.0 },
  { url: "/public/search", changeFrequency: "daily", priority: 0.8 },
  { url: "/faq/privacidad", changeFrequency: "yearly", priority: 0.3 },
  { url: "/faq/terminos", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sacaturno.com.ar";

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${baseUrl}${p.url}`,
    lastModified: new Date("2025-01-01"),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  try {
    const { data } = await axiosReq.get<{ slug: string; updatedAt: string }[]>(
      "/business/sitemap"
    );
    const businessEntries: MetadataRoute.Sitemap = data.map((b) => ({
      url: `${baseUrl}/${b.slug}`,
      lastModified: new Date(b.updatedAt),
      changeFrequency: "weekly" as ChangeFreq,
      priority: 0.7,
    }));
    return [...staticEntries, ...businessEntries];
  } catch {
    return staticEntries;
  }
}
