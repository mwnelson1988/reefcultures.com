import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { products } from "@/lib/store/products";

export default function StorePage() {
  return (
    <Container className="py-14">
      <h1 className="text-3xl font-extrabold tracking-tight">Store</h1>
      <p className="mt-3 max-w-2xl opacity-85">
        This store is wired for Stripe Checkout. Replace these demo products with your real catalog.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id}>
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="mt-2 text-sm opacity-80">{p.description}</div>
            <div className="mt-4 text-2xl font-extrabold">
              ${(p.priceCents / 100).toFixed(2)}
            </div>

            <form action="/api/checkout" method="post" className="mt-5">
              <input type="hidden" name="productId" value={p.id} />
              <Button type="submit">Checkout</Button>
            </form>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-sm opacity-75">
        Tip: Stripe requires you to create products/prices in Stripe if you want a dynamic catalog. This starter uses a
        server-side “price_data” object so you can test quickly.
      </div>
    </Container>
  );
}
