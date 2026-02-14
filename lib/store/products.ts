export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
};

export const products: Product[] = [
  { id: "reef-starter-kit", name: "Reef Starter Kit", description: "A clean starter bundle for new reef tanks.", priceCents: 4900 },
  { id: "phyto-pack", name: "Phyto Pack", description: "Feeding support for pods and filter feeders.", priceCents: 1900 },
  { id: "pod-boost", name: "Pod Boost", description: "A simple way to support pod populations.", priceCents: 2900 },
];
