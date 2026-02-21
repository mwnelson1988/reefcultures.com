import Image from "next/image";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { products } from "@/lib/store/products";

function formatUSD(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function getSavingsLabel(p: { id: string; priceCents: number }) {
  // Only show savings under the 32oz item
  if (p.id !== "phyto-32oz") return null;

  const p16 = products.find((x) => x.id === "phyto-16oz");
  if (!p16) return null;

  // Compare cost per ounce: 16oz vs 32oz
  const costPerOz16 = p16.priceCents / 16;
  const costPerOz32 = p.priceCents / 32;

  if (!Number.isFinite(costPerOz16) || !Number.isFinite(costPerOz32) || costPerOz16 <= 0) return null;

  const pct = Math.round(((costPerOz16 - costPerOz32) / costPerOz16) * 100);

  // Only show if it's a meaningful discount
  if (pct <= 0) return null;

  return `Save ${pct}% vs 16oz`;
}

export default function StorePage() {
  return (
    <Container className="py-14">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Store</h1>
        <p className="mt-3 text-base opacity-85">
          Premium live phytoplankton — small batch cultured in O’Fallon, MO.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2">
        {products.map((p) => {
          const savings = getSavingsLabel(p);

          return (
            <Card key={p.id}>
              <div className="flex h-full flex-col">
                {/* Image */}
                <div className="relative w-full overflow-hidden rounded-xl border border-brand-border/60 bg-white/5">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-contain p-6"
                      priority={false}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="mt-5 flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-lg font-semibold leading-snug">{p.name}</div>

                    <div className="shrink-0 text-right">
                      <div className="text-xl font-extrabold">{formatUSD(p.priceCents)}</div>
                      {savings ? (
                        <div className="mt-1 text-xs font-semibold text-white/80">
                          {savings}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-2 text-sm opacity-80">{p.description}</div>

                  <div className="mt-4 border-t border-brand-border/40 pt-4">
                    <ul className="space-y-2 text-sm opacity-85">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand-border bg-white/5 text-xs">
                            ✓
                          </span>
                          <span className="leading-snug">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <form action="/api/checkout" method="post" className="mt-6">
                    <input type="hidden" name="productId" value={p.id} />
                    <Button type="submit" className="w-full py-3 text-sm">
                      Checkout
                    </Button>
                  </form>

                  <div className="mt-3 text-xs opacity-60 text-center">
                    Ships cold-packed. Refrigerate on arrival.
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}