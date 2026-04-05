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
      "A compact bottle for nano reefs, pod cultures, and hobbyists starting a steady feeding routine.",
    priceLabel: "$19.99",
    priceIdEnv: "STRIPE_PRICE_PHYTO_16OZ",
    bullets: [
      "Batch-tracked live culture",
      "$6.99 flat-rate cold shipping or free local pickup",
      "Easy starting point for consistent daily dosing",
    ],
    bestFor: "Nano reefs, pod cultures, and first-time buyers",
    approxCoverage: "Best for smaller systems and lighter daily use",
    useCases: ["Nano reef", "Starter routine", "Pod feeding"],
  },
  {
    slug: "phyto-32oz",
    name: "Live Phytoplankton",
    size: "32oz",
    subtitle:
      "Our most balanced option for mixed reefs, repeat buyers, and customers who want more volume without overbuying.",
    priceLabel: "$27.99",
    priceIdEnv: "STRIPE_PRICE_PHYTO_32OZ",
    bullets: [
      "Most popular size",
      "$6.99 flat-rate cold shipping or free local pickup",
      "Strong fit for regular reef feeding routines",
    ],
    bestFor: "Most mixed reefs and repeat customers",
    approxCoverage: "A dependable middle-ground for moderate daily use",
    useCases: ["Mixed reef", "Coral nutrition", "Routine dosing"],
  },
  {
    slug: "phyto-64oz",
    name: "Live Phytoplankton",
    size: "64oz",
    subtitle:
      "High-volume supply for larger systems, heavier feeding schedules, and hobbyists who want fewer reorder cycles.",
    priceLabel: "$34.99",
    priceIdEnv: "STRIPE_PRICE_PHYTO_64OZ",
    bullets: [
      "Best value per ounce",
      "$6.99 flat-rate cold shipping or free local pickup",
      "Built for larger reefs and heavier feeding demand",
    ],
    bestFor: "Large reefs, heavier feeding, and fewer reorders",
    approxCoverage: "Best value for high-consumption systems",
    useCases: ["Large reef", "Heavy feeders", "Best value"],
  },
];
