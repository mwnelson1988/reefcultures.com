export type StoreProduct = {
  sku: "phyto_16oz" | "phyto_32oz" | "phyto_64oz";
  sizeLabel: string;
  name: string;
  description: string;
  bullets: string[];
  badge?: string;
  imageSrc: string;
  price: number; // display only
  envPriceKey: string; // Stripe Price ID env var name
};

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    sku: "phyto_16oz",
    sizeLabel: "16oz",
    name: "Live Phytoplankton",
    description: "High-density, live marine culture. Cold-chain shipped.",
    bullets: [
      "Batch tracked",
      "Live culture, high density",
      "Reef-safe handling & storage guidance",
    ],
    imageSrc: "/phyto-16oz.png",
    price: 19.99,
    envPriceKey: "STRIPE_PRICE_PHYTO_16OZ",
  },
  {
    sku: "phyto_32oz",
    sizeLabel: "32oz",
    name: "Live Phytoplankton",
    description: "Maximum volume for heavy feeders and larger systems.",
    bullets: ["Save vs. smaller sizes", "Cold-chain shipping", "Ideal for frequent dosing"],
    badge: "Best value",
    imageSrc: "/phyto-32oz.png",
    price: 27.99,
    envPriceKey: "STRIPE_PRICE_PHYTO_32OZ",
  },
  {
    sku: "phyto_64oz",
    sizeLabel: "64oz",
    name: "Live Phytoplankton",
    description: "High-volume supply for larger systems and consistent daily dosing.",
    bullets: [
      "Best for larger reefs",
      "Cold-chain shipping",
      "Fewer re-orders, consistent dosing",
    ],
    badge: "High volume",
    imageSrc: "/phyto-64oz.png",
    price: 44.99, // change this if you want
    envPriceKey: "STRIPE_PRICE_PHYTO_64OZ",
  },
];