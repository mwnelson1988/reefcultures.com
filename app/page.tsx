import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import DoseEstimator from "@/components/DoseEstimator";
import { products } from "@/lib/products";

const pillars = [
  {
    title: "Batch tracked",
    desc: "Every production run is positioned as a controlled, traceable batch instead of anonymous commodity product.",
  },
  {
    title: "Packed cold",
    desc: "Cold-chain minded packing helps protect refrigerated live culture quality during transit.",
  },
  {
    title: "Routine friendly",
    desc: "Clear size options and dosing guidance make it easier to build a repeatable reef-feeding workflow.",
  },
  {
    title: "Clean storefront",
    desc: "Straightforward product pages and checkout make reordering easier.",
  },
];

const shippingFacts = [
  { k: "Bottle pricing", v: "Straight bottle pricing by size" },
  { k: "Shipping", v: "$6.99 flat-rate cold shipping" },
  { k: "Pickup", v: "Free local pickup available" },
  { k: "Handling", v: "Refrigerated live culture" },
  { k: "Checkout", v: "Secure Stripe checkout" },
];

const fitCards = [
  {
    title: "Mixed reefs",
    body: "A clean way to support daily or near-daily feeding routines without making the storefront feel hobby-grade.",
  },
  {
    title: "Pod systems",
    body: "A strong fit for hobbyists feeding copepods and filter-feeding livestock with a refrigerated live option.",
  },
  {
    title: "Premium reefers",
    body: "Built for customers who care about process, consistency, packaging, and a more elevated buying experience.",
  },
];

const faqPreview = [
  ["How should it be stored?", "Keep refrigerated on arrival. Shake gently before dosing. Do not freeze."],
  ["How do I pick a size?", "Choose based on tank volume, feeding frequency, and how often you want to reorder."],
  ["Why buy refrigerated live phyto?", "It better matches the premium, fresh-culture positioning expected by serious reef hobbyists."],
  ["Can I use it for pods and filter feeders?", "Yes — it is positioned for reef systems, pods, corals, and other filter-feeding routines."],
];

function ProductSpotlight({
  slug,
  imageSrc,
}: {
  slug: string;
  imageSrc: string;
}) {
  const product = products.find((p) => p.slug === slug)!;

  return (
    <div className="group overflow-hidden rounded-3xl border border-hair bg-panel/10 ring-1 ring-white/[0.06] shadow-[0_18px_60px_-30px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-panel/15">
      <div className="relative h-[320px] overflow-hidden bg-bg/20">
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_35%,rgba(255,255,255,0.12),rgba(0,0,0,0))]" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/0 via-bg/10 to-bg/70" />
        <Image
          src={imageSrc}
          alt={`${product.name} ${product.size}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-center scale-[1.08] drop-shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
        />
        <div className="absolute left-1/2 bottom-6 h-10 w-[62%] -translate-x-1/2 rounded-full bg-black/25 blur-xl" />
      </div>

      <div className="p-7">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted">
          {product.size}
        </div>
        <div className="mt-3 text-xl font-semibold text-ink">
          {product.name}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">{product.subtitle}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {product.useCases.map((tag) => (
            <div
              key={tag}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/68"
            >
              {tag}
            </div>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted">Price</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{product.priceLabel}</div>
          </div>
          <Link
            href={`/store/${product.slug}`}
            className="inline-flex items-center justify-center px-5 py-3 border border-hair text-[12px] font-semibold uppercase tracking-[0.20em] text-muted transition hover:text-ink hover:border-accent"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-ocean-radial" />
        <div className="rc-container relative pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-4xl">
            <Reveal>
              <div className="rc-kicker text-muted">ReefCultures</div>
              <div className="mt-4 inline-flex items-center rounded-full border border-[rgba(29,211,197,0.28)] bg-[rgba(29,211,197,0.08)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(29,211,197,0.92)]">Cold shipped or free local pickup</div>
              <h1 className="mt-5 text-hero font-extrabold">
                Premium live phytoplankton
                <br />
                for serious reef systems.
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-7 max-w-3xl text-muted leading-relaxed">
                Fresh refrigerated marine phytoplankton with batch-tracked handling, clean bottle sizing, and a straightforward checkout flow for repeat reef keepers.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/store/phyto-32oz"
                  className="inline-flex items-center justify-center px-7 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.20em] hover:bg-accent transition"
                >
                  Shop 32oz best seller
                </Link>
                <Link
                  href="/science"
                  className="inline-flex items-center justify-center px-7 py-3 border border-hair text-[12px] font-semibold uppercase tracking-[0.20em] text-muted hover:text-ink hover:border-accent transition"
                >
                  See quality process
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="mt-12 grid gap-4 md:grid-cols-4">
                {shippingFacts.map((item) => (
                  <div
                    key={item.k}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-white/[0.05]"
                  >
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/55">
                      {item.k}
                    </div>
                    <div className="mt-2 text-sm font-medium text-white/85">{item.v}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="rc-section pt-0">
        <div className="rc-container">
          <div className="grid gap-6 lg:grid-cols-3">
            <Reveal>
              <ProductSpotlight slug="phyto-16oz" imageSrc="/images/bottles/IMG_0092.jpeg" />
            </Reveal>
            <Reveal delay={0.06}>
              <ProductSpotlight slug="phyto-32oz" imageSrc="/images/bottles/IMG_0093.jpeg" />
            </Reveal>
            <Reveal delay={0.12}>
              <ProductSpotlight slug="phyto-64oz" imageSrc="/images/bottles/IMG_0094.jpeg" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="rc-section">
        <div className="rc-container">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="rc-kicker text-muted">Why reef keepers choose it</div>
                <h2 className="mt-4 text-display font-bold">
                  Batch-tracked live phyto with a cleaner path to reorder.
                </h2>
                <p className="mt-6 text-muted leading-relaxed">
                  Reef hobbyists want consistency, clean handling, and a product they can reorder without guesswork.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-4 md:grid-cols-2">
                {pillars.map((item, idx) => (
                  <Reveal key={item.title} delay={0.06 + idx * 0.05}>
                    <div className="rounded-3xl border border-hair bg-panel/10 p-7 ring-1 ring-white/[0.05] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.70)] min-h-[210px]">
                      <div className="text-[12px] uppercase tracking-[0.22em] text-ink/90">
                        {item.title}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted">
                        {item.desc}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rc-section">
        <div className="rc-container">
          <Reveal>
            <DoseEstimator />
          </Reveal>
        </div>
      </section>

      <section className="rc-section">
        <div className="rc-container">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="rc-kicker text-muted">Pick the right bottle</div>
                <h2 className="mt-4 text-display font-bold">
                  A simple comparison table removes guesswork.
                </h2>
                <p className="mt-6 text-muted leading-relaxed">
                  Customers should instantly see which size is the best fit for their
                  system, feeding habits, and reorder preference.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <Reveal delay={0.08}>
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] ring-1 ring-white/[0.06]">
                  <div className="grid grid-cols-4 gap-0 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-white/55">
                    <div>Size</div>
                    <div>Best for</div>
                    <div>Positioning</div>
                    <div>Price</div>
                  </div>
                  {products.map((product) => (
                    <div
                      key={product.slug}
                      className="grid grid-cols-4 gap-0 border-b border-white/10 px-5 py-5 text-sm text-white/78 last:border-b-0"
                    >
                      <div className="font-semibold text-white">{product.size}</div>
                      <div>{product.bestFor}</div>
                      <div>{product.approxCoverage}</div>
                      <div>{product.priceLabel}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="rc-section">
        <div className="rc-container">
          <div className="grid gap-4 md:grid-cols-3">
            {fitCards.map((card, idx) => (
              <Reveal key={card.title} delay={0.05 + idx * 0.05}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 ring-1 ring-white/[0.06]">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                    Ideal use case
                  </div>
                  <div className="mt-3 text-xl font-semibold text-white">{card.title}</div>
                  <p className="mt-3 text-sm leading-relaxed text-white/72">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="rc-section">
        <div className="rc-container">
          <div className="rounded-3xl border border-hair bg-panel/10 ring-1 ring-white/[0.06] p-10 md:p-12 shadow-[0_18px_70px_-45px_rgba(0,0,0,0.75)]">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <Reveal>
                  <div className="rc-kicker text-muted">FAQ preview</div>
                  <h3 className="mt-4 text-display font-bold">
                    The professional questions should already be answered.
                  </h3>
                </Reveal>
              </div>

              <div className="lg:col-span-5 lg:flex lg:justify-end">
                <Reveal delay={0.08}>
                  <Link
                    href="/faq"
                    className="inline-flex items-center justify-center px-7 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.20em] hover:bg-accent transition"
                  >
                    View full FAQ
                  </Link>
                </Reveal>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {faqPreview.map(([q, a], idx) => (
                <Reveal key={q} delay={0.1 + idx * 0.04}>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <div className="text-sm font-semibold text-white">{q}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/72">{a}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
