export type Product = {
  slug: string;
  name: string;
  size: string;
  subtitle: string;
  priceLabel: string;
  priceIdEnv: string;
  bullets: string[];
  bestFor: string;
  approxCoverage: string;
  useCases: string[];
};

export const products: Product[] = [
  {
    slug: "phyto-16oz",
    name: "Live Phytoplankton",
    size: "16oz",
    subtitle:
      "Fresh refrigerated marine culture for nano reefs, smaller systems, and first-time daily dosing routines.",
    priceLabel: "$19.99",
    priceIdEnv: "STRIPE_PRICE_PHYTO_16OZ",
    bullets: [
      "Batch tracked",
      "Cold-chain packed",
      "Easy entry point for consistent daily dosing",
    ],
    bestFor: "Nano reefs, mixed reefs, and first-time buyers",
    approxCoverage: "Best for lighter-use systems and smaller tanks",
    useCases: ["Nano reef", "Starter routine", "Pod feeding"],
  },
  {
    slug: "phyto-32oz",
    name: "Live Phytoplankton",
    size: "32oz",
    subtitle:
      "Balanced option for mixed reefs and hobbyists who want more coverage without stepping up to the largest bottle.",
    priceLabel: "$27.99",
    priceIdEnv: "STRIPE_PRICE_PHYTO_32OZ",
    bullets: [
      "Most versatile size",
      "Cold-chain packed",
      "Great fit for consistent weekly routines",
    ],
    bestFor: "Most mixed reefs and repeat customers",
    approxCoverage: "A strong middle-ground for moderate daily use",
    useCases: ["Mixed reef", "Coral nutrition", "Routine dosing"],
  },
  {
    slug: "phyto-64oz",
    name: "Live Phytoplankton",
    size: "64oz",
    subtitle:
      "High-volume supply for larger systems, heavier feeding schedules, and customers who want fewer reorder cycles.",
    priceLabel: "$44.99",
    priceIdEnv: "STRIPE_PRICE_PHYTO_64OZ",
    bullets: [
      "Best value per ounce",
      "Cold-chain packed",
      "Built for larger reefs and heavier feeding demand",
    ],
    bestFor: "Large reefs, heavier feeding, and fewer reorders",
    approxCoverage: "Best value for high-consumption systems",
    useCases: ["Large reef", "Heavy feeders", "Best value"],
  },
];
