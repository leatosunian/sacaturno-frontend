import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sacaturno.com.ar";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/public/search`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/faq/privacidad`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/faq/terminos`,
      lastModified: new Date(),
    },
  ];
}
