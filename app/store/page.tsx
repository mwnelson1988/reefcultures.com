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
        Premium live phytoplankton, small batch cultured in O’Fallon, MO.
      </p>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {products.map((p) => (
          <Card key={p.id}>
            <div className="flex flex-col items-center text-center">

              {/* Smaller, balanced product image */}
              <div className="relative w-[180px] h-[240px] rounded-xl overflow-hidden border border-brand-border/60 bg-black/10">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-contain p-4"
                  priority={false}
                />
              </div>

              <div className="mt-6 text-lg font-semibold">{p.name}</div>
              <div className="mt-2 text-sm opacity-80 max-w-[26ch]">
                {p.description}
              </div>

              <div className="mt-4 text-2xl font-extrabold">
                ${(p.priceCents / 100).toFixed(2)}
              </div>

              {/* Bullets */}
              <ul className="mt-4 space-y-2 text-sm opacity-85">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 justify-center">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-muted/60 border border-brand-border text-xs">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <form
                action="/api/checkout"
                method="post"
                className="mt-6 w-full flex justify-center"
              >
                <input type="hidden" name="productId" value={p.id} />
                <Button type="submit" className="px-8">
                  Checkout
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}