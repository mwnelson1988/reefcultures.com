// lib/packing.ts
export type CartItem = {
  sku: string;
  name?: string;
  qty: number;
  unit_amount?: number; // cents (optional)
};

export type PackedPackage = {
  // total package measurements for rate quoting
  weightOz: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;

  // optional metadata
  preset: "BOX_16OZ" | "BOX_32OZ";
  items: CartItem[];
};

const PRESETS = {
  BOX_16OZ: {
    preset: "BOX_16OZ" as const,
    weightOz: 24, // 1.5 lb
    lengthIn: 8,
    widthIn: 6,
    heightIn: 4,
  },
  BOX_32OZ: {
    preset: "BOX_32OZ" as const,
    weightOz: 40, // 2.5 lb
    lengthIn: 10,
    widthIn: 8,
    heightIn: 6,
  },
};

/**
 * Decide which box preset to use.
 * Rule: if any item is a 32oz bottle -> use 32oz preset. Otherwise use 16oz preset.
 *
 * If you later want multi-box shipping for multiple bottles, we can expand this,
 * but this is a solid v1 that keeps it simple.
 */
function choosePreset(items: CartItem[]) {
  const has32 =
    items.some((i) => String(i.sku).toUpperCase().includes("32")) ||
    items.some((i) => String(i.sku).toUpperCase().includes("PHYTO_32OZ"));

  return has32 ? PRESETS.BOX_32OZ : PRESETS.BOX_16OZ;
}

export function buildPackages(items: CartItem[]): PackedPackage[] {
  const preset = choosePreset(items);

  // If qty > 1, we’ll still quote with one box for now.
  // (This avoids weird customer experiences until we implement multi-box splitting.)
  // You can add a small weight bump per extra bottle:
  const totalQty = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);

  const extraPerBottleOz = 6; // packing + cold pack padding estimate
  const weightOz = preset.weightOz + Math.max(0, totalQty - 1) * extraPerBottleOz;

  return [
    {
      preset: preset.preset,
      weightOz,
      lengthIn: preset.lengthIn,
      widthIn: preset.widthIn,
      heightIn: preset.heightIn,
      items,
    },
  ];
}