export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  image: string;
  bullets: string[];
};

export const products: Product[] = [
  {
    id: "phyto-16oz",
    name: "16oz Live Phytoplankton",
    description: "Fresh live phytoplankton for reef tanks.",
    priceCents: 1999,
    image: "/phyto-16oz.png",
    bullets: [
      "Live phytoplankton for reef tanks",
      "Supports copepods & filter feeders",
      "Refrigerate on arrival",
    ],
  },
  {
    id: "phyto-32oz",
    name: "32oz Live Phytoplankton",
    description: "Fresh live phytoplankton for reef tanks.",
    priceCents: 2799,
    image: "/phyto-32oz.png",
    bullets: [
      "Best value for frequent dosing",
      "Supports copepods & filter feeders",
      "Refrigerate on arrival",
    ],
  },
];