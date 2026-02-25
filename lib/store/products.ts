// lib/store/products.ts

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
    price: 44.99,
    envPriceKey: "STRIPE_PRICE_PHYTO_64OZ",
  },
];

/**
 * UI-facing Product type used across components like ProductCard.
 * This matches what your components currently reference:
 * - product.id
 * - product.image
 * - product.description
 * - product.priceCents
 * - product.bullets
 */
export type Product = {
  id: string;            // ✅ ProductCard uses this (we set it to slug)
  slug: string;          // keeps compatibility with shipping-rates logic
  name: string;
  size: string;          // e.g. "16oz"
  description: string;   // ✅ ProductCard uses this
  subtitle: string;      // optional extra, used elsewhere
  bullets: string[];
  badge?: string;

  image: string;         // ✅ ProductCard uses this
  imageSrc: string;      // keep original naming too

  price: number;         // optional display value
  priceCents: number;    // ✅ ProductCard uses this
  priceLabel: string;    // e.g. "$19.99"
  priceIdEnv: string;    // env var name for Stripe price ID
};

export const products: Product[] = STORE_PRODUCTS.map((p) => {
  const slug = p.sku.replace("_", "-"); // phyto_16oz -> phyto-16oz
  const priceCents = Math.round(p.price * 100);

  return {
    id: slug,                 // ✅ IMPORTANT: ProductCard sends product.id to shipping + checkout
    slug,
    name: p.name,
    size: p.sizeLabel,
    description: p.description, // ✅ ProductCard
    subtitle: p.description,
    bullets: p.bullets,
    badge: p.badge,

    image: p.imageSrc,        // ✅ ProductCard uses product.image
    imageSrc: p.imageSrc,

    price: p.price,
    priceCents,
    priceLabel: `$${p.price.toFixed(2)}`,
    priceIdEnv: p.envPriceKey,
  };
});