export type Product = {
  slug: string;
  name: string;
  size: string;
  subtitle: string;
  priceLabel: string;
  priceIdEnv: string;
  bullets: string[];
};

export const products: Product[] = [
  {
    slug: "phyto-16oz",
    name: "Live Phytoplankton",
    size: "16oz",
    subtitle: "High-density, live marine culture. Cold-chain shipped.",
    priceLabel: "$19.99",
    priceIdEnv: "STRIPE_PRICE_PHYTO_16OZ",
    bullets: [
      "Batch tracked",
      "Live culture, high density",
      "Reef-safe handling & storage guidance",
    ],
  },
  {
    slug: "phyto-32oz",
    name: "Live Phytoplankton",
    size: "32oz",
    subtitle: "Maximum volume for heavy feeders and larger systems.",
    priceLabel: "$27.99",
    priceIdEnv: "STRIPE_PRICE_PHYTO_32OZ",
    bullets: [
      "Save vs. smaller sizes",
      "Cold-chain shipping",
      "Ideal for frequent dosing",
    ],
  },
  {
    slug: "phyto-64oz",
    name: "Live Phytoplankton",
    size: "64oz",
    subtitle: "High-volume supply for larger systems and consistent daily dosing.",
    priceLabel: "$44.99",
    priceIdEnv: "STRIPE_PRICE_PHYTO_64OZ",
    bullets: [
      "Best for larger reefs",
      "Cold-chain shipping",
      "Fewer re-orders, consistent dosing",
    ],
  },
];