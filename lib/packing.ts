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
  preset: "BOX_16OZ" | "BOX_32OZ" | "BOX_64OZ" | "BOX_1GAL";
  items: CartItem[];
};

const PRESETS = {
  BOX_16OZ: {
    preset: "BOX_16OZ" as const,
    // Shipping-ready estimate including insulation + cold pack + padding.
    // Tune these after your first 5 shipments.
    weightOz: 40, // 2.5 lb
    lengthIn: 10,
    widthIn: 8,
    heightIn: 6,
  },
  BOX_32OZ: {
    preset: "BOX_32OZ" as const,
    weightOz: 64, // 4.0 lb
    lengthIn: 10,
    widthIn: 8,
    heightIn: 6,
  },
  BOX_64OZ: {
    preset: "BOX_64OZ" as const,
    weightOz: 96, // 6.0 lb
    lengthIn: 12,
    widthIn: 10,
    heightIn: 8,
  },
  BOX_1GAL: {
    preset: "BOX_1GAL" as const,
    weightOz: 192, // 12.0 lb
    lengthIn: 12,
    widthIn: 12,
    heightIn: 10,
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
  const upper = items.map((i) => String(i.sku || "").toUpperCase());

  const has1gal = upper.some((s) => s.includes("1GAL") || s.includes("GALLON"));
  if (has1gal) return PRESETS.BOX_1GAL;

  const has64 = upper.some((s) => s.includes("64") || s.includes("PHYTO_64OZ"));
  if (has64) return PRESETS.BOX_64OZ;

  const has32 = upper.some((s) => s.includes("32") || s.includes("PHYTO_32OZ"));
  if (has32) return PRESETS.BOX_32OZ;

  return PRESETS.BOX_16OZ;
}

export function buildPackages(items: CartItem[]): PackedPackage[] {
  const preset = choosePreset(items);

  // V1: single-box quoting.
  // Conservative bump per extra bottle (more liquid + padding).
  const totalQty = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const extraPerBottleOz =
    preset.preset === "BOX_1GAL" ? 24 : preset.preset === "BOX_64OZ" ? 16 : 10;
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