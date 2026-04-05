export type CartItem = {
  slug: string;
  quantity: number;
};

export const CART_STORAGE_KEY = "reefcultures_cart_v1";

export function clampCartQuantity(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(24, Math.round(n)));
}

export function normalizeCartItems(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];

  const merged = new Map<string, number>();

  for (const raw of input) {
    const slug = String((raw as any)?.slug || "").trim();
    if (!slug) continue;
    const quantity = clampCartQuantity((raw as any)?.quantity ?? 1);
    merged.set(slug, (merged.get(slug) || 0) + quantity);
  }

  return Array.from(merged.entries()).map(([slug, quantity]) => ({
    slug,
    quantity: clampCartQuantity(quantity),
  }));
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return normalizeCartItems(JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || "[]"));
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizeCartItems(items)));
  window.dispatchEvent(new Event("reefcart:updated"));
}

export function addToCart(slug: string, quantity = 1) {
  const items = readCart();
  const existing = items.find((item) => item.slug === slug);
  if (existing) {
    existing.quantity = clampCartQuantity(existing.quantity + quantity);
  } else {
    items.push({ slug, quantity: clampCartQuantity(quantity) });
  }
  writeCart(items);
}

export function updateCartItem(slug: string, quantity: number) {
  const items = readCart()
    .map((item) =>
      item.slug === slug ? { ...item, quantity: clampCartQuantity(quantity) } : item
    )
    .filter((item) => item.quantity > 0);
  writeCart(items);
}

export function removeCartItem(slug: string) {
  writeCart(readCart().filter((item) => item.slug !== slug));
}

export function clearCart() {
  writeCart([]);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + clampCartQuantity(item.quantity), 0);
}
