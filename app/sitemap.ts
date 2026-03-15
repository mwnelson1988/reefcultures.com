import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://reefcultures.com";

  const routes = [
    "",
    "/store",
    "/about",
    "/science",
    "/quality",
    "/faq",
    "/contact",
    "/policies",
    "/terms",
    "/privacy",
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/store" ? 0.9 : 0.6,
  }));
}
