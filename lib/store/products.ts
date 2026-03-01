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
  envPriceKey: "STRIPE_PRICE_PHYTO_16OZ" | "STRIPE_PRICE_PHYTO_32OZ" | "STRIPE_PRICE_PHYTO_64OZ"; // Stripe Price ID env var name
};

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    sku: "phyto_16oz",
    sizeLabel: "16oz",
    name: "Live Phytoplankton",
    description: "High-density, live marine culture. Cold-chain shipped.",
    bullets: ["Batch tracked", "Live culture, high density", "Reef-safe handling & storage guidance"],
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
    bullets: ["Best for larger reefs", "Cold-chain shipping", "Fewer re-orders, consistent dosing"],
    badge: "High volume",
    imageSrc: "/phyto-64oz.png",
    price: 44.99,
    envPriceKey: "STRIPE_PRICE_PHYTO_64OZ",
  },
];

/**
 * UI-facing Product type used across components like ProductCard.
 * Matches:
 * - product.id
 * - product.image
 * - product.description
 * - product.priceCents
 * - product.bullets
 */
export type Product = {
  id: string; // we set to slug
  slug: string;

  name: string;
  size: string; // e.g. "16oz"
  description: string;
  subtitle: string;
  bullets: string[];
  badge?: string;

  image: string;
  imageSrc: string;

  price: number;
  priceCents: number;
  priceLabel: string;

  priceIdEnv: StoreProduct["envPriceKey"]; // env var name
};

function skuToSlug(sku: StoreProduct["sku"]): string {
  // Make it robust: replace ALL underscores with hyphens
  return sku.replaceAll("_", "-"); // phyto_64oz -> phyto-64oz
}

export const products: Product[] = STORE_PRODUCTS.map((p) => {
  const slug = skuToSlug(p.sku);
  const priceCents = Math.round(p.price * 100);

  return {
    id: slug,
    slug,

    name: p.name,
    size: p.sizeLabel,
    description: p.description,
    subtitle: p.description,
    bullets: p.bullets,
    badge: p.badge,

    image: p.imageSrc,
    imageSrc: p.imageSrc,

    price: p.price,
    priceCents,
    priceLabel: `$${p.price.toFixed(2)}`,

    priceIdEnv: p.envPriceKey,
  };
});

/**
 * 🔑 The missing piece:
 * Many routes/pages use a lookup map + helper.
 * This is what prevents "Unknown product slug: phyto-64oz"
 */
export const PRODUCTS_BY_SLUG: Record<string, Product> = Object.fromEntries(
  products.map((p) => [p.slug, p])
);

export function getProductBySlug(slug: string): Product {
  const p = PRODUCTS_BY_SLUG[slug];
  if (!p) throw new Error(`Unknown product slug: ${slug}`);
  return p;
}

/**
 * For checkout routes:
 * Get Stripe Price ID from env for a given product slug.
 * (Stripe Price IDs start with "price_")
 */
export function getStripePriceIdForSlug(slug: string): string {
  const product = getProductBySlug(slug);
  const envName = product.priceIdEnv;
  const v = process.env[envName];

  if (!v) {
    throw new Error(`Missing environment variable: ${envName}`);
  }
  if (!String(v).startsWith("price_")) {
    throw new Error(
      `Invalid Stripe Price ID in ${envName}. Must start with "price_". Got: ${v}`
    );
  }

  return v;
}