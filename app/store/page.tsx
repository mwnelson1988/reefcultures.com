import Image from "next/image";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { products } from "@/lib/store/products";

export default function StorePage() {
  return (
    <Container className="py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-center">Store</h1>
      <p className="mt-3 max-w-2xl mx-auto opacity-85 text-center">
        This store is wired for Stripe Checkout. Replace these demo products with your real catalog.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id}>
            <div className="flex flex-col items-center text-center">
              {/* Product image */}
              <div className="relative w-full max-w-[260px] aspect-[3/4] rounded-xl overflow-hidden border border-brand-border/60 bg-black/10">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-contain"
                  priority={false}
                />
              </div>

              <div className="mt-5 text-lg font-semibold">{p.name}</div>
              <div className="mt-2 text-sm opacity-80 max-w-[28ch]">{p.description}</div>

              <div className="mt-4 text-2xl font-extrabold">
                ${(p.priceCents / 100).toFixed(2)}
              </div>

              {/* Bullets */}
              <ul className="mt-4 space-y-2 text-sm opacity-85">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-muted/60 border border-brand-border text-xs">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <form action="/api/checkout" method="post" className="mt-6 w-full flex justify-center">
                <input type="hidden" name="productId" value={p.id} />
                <Button type="submit" className="px-7 text-sm">
                  Checkout
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-sm opacity-75 text-center">
        Tip: Stripe requires you to create products/prices in Stripe if you want a dynamic catalog. This starter uses a
        server-side “price_data” object so you can test quickly.
      </div>
    </Container>
  );
}