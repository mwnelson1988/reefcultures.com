import Link from "next/link";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

function Bullet() {
  return (
    <span className="mt-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/15 bg-white/5">
      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--brand-primary))]" />
    </span>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="px-7 py-7 md:px-9 md:py-8">
        {title ? (
          <div className="text-center">
            <h2 className="text-base md:text-lg font-semibold tracking-tight text-white">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-xs md:text-sm text-white/65">{subtitle}</p>
            ) : null}
          </div>
        ) : null}
        <div className={title ? "mt-6" : ""}>{children}</div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const launchLabel = "Launch May 1st";

  return (
    <Container className="relative overflow-hidden">
      {/* Cleaner background glow */}
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[rgb(var(--brand-primary))]/12 blur-[190px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] via-transparent to-transparent" />

      <section className="relative mx-auto max-w-3xl px-4 pt-10 pb-16 md:pt-14">
        <div className="space-y-7">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-[0_26px_90px_rgba(0,0,0,0.45)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-[560px] -translate-x-1/2 rounded-full bg-[rgb(var(--brand-primary))]/10 blur-[120px]" />

            <div className="relative px-7 py-9 md:px-10 md:py-10">
              {/* Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-white/80">
                  <span className="h-2 w-2 rounded-full bg-[rgb(var(--brand-primary))]" />
                  Early Access • {launchLabel}
                </div>
              </div>

              {/* Headline */}
              <h1 className="mt-5 text-center text-4xl md:text-5xl font-semibold tracking-tight text-white">
                Reef Cultures
              </h1>

              {/* Subheading */}
              <p className="mt-3 text-center text-sm md:text-base text-white/75 leading-relaxed">
                Fresh phyto and reef essentials—clean, consistent, and shipped with care.
              </p>

              {/* Benefits */}
              <div className="mt-7 mx-auto max-w-xl space-y-3 text-sm">
                <div className="flex gap-3">
                  <Bullet />
                  <p className="text-white/85">
                    <span className="font-semibold text-white">20% off your first order</span>{" "}
                    when you sign up before launch.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Bullet />
                  <p className="text-white/85">
                    Pre-launch members get{" "}
                    <span className="font-semibold text-white">first priority</span>{" "}
                    on fresh phyto drops.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Bullet />
                  <p className="text-white/85">
                    Account dashboard ready for{" "}
                    <span className="font-semibold text-white">order history & tracking</span>.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button href="/auth/signup" className="px-7 text-sm">
                  Get Early Access
                </Button>

                <Link
                  href="/store"
                  className="text-sm text-white/70 hover:text-white underline underline-offset-4"
                >
                  Browse the Store
                </Link>
              </div>

              {/* Secondary */}
              <div className="mt-4 text-center text-xs text-white/60">
                Already a member?{" "}
                <Link className="underline hover:text-white" href="/auth/signin">
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          {/* Sections - matching professional cards */}
          <Card title="What sets Reef Cultures apart" subtitle="Clean standards. Consistent outcomes. Delivered fresh.">
            <div className="grid gap-5 md:grid-cols-3 text-sm">
              <div>
                <p className="font-semibold text-white">Density-first cultures</p>
                <p className="mt-2 text-white/70 leading-relaxed">
                  Cultured for real nutrition—not watered down. Built to support pods and reef systems with consistency.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">Process over hobby</p>
                <p className="mt-2 text-white/70 leading-relaxed">
                  Controlled cycles and disciplined handling to deliver repeatable results—batch after batch.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">Quality you can trust</p>
                <p className="mt-2 text-white/70 leading-relaxed">
                  Clean standards and quality checks—no guesswork, no shortcuts, and no surprises.
                </p>
              </div>
            </div>
          </Card>

          <Card title="What makes our phyto different">
            <p className="text-sm text-white/75 leading-relaxed">
              We focus on density, freshness, and consistency—so your feeding routine stays predictable and your system stays stable.
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex gap-3">
                <Bullet />
                <p className="text-white/80">Cultured to peak readiness before packaging.</p>
              </div>
              <div className="flex gap-3">
                <Bullet />
                <p className="text-white/80">Handled with a freshness-first approach from culture to shipment.</p>
              </div>
              <div className="flex gap-3">
                <Bullet />
                <p className="text-white/80">Designed for consistent copepod and reef feeding routines.</p>
              </div>
            </div>
          </Card>

          <Card title="Built like a lab, not a hobby">
            <p className="text-sm text-white/75 leading-relaxed">
              Reef Cultures is run with disciplined standards—clean rotations, controlled methods, and repeatable outcomes you can rely on.
            </p>
          </Card>

          <Card title="Who it’s for">
            <p className="text-sm text-white/75 leading-relaxed">
              For reef keepers who want dependable live nutrition and a consistent supply—without guesswork.
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex gap-3">
                <Bullet />
                <p className="text-white/80">Reef aquariums and coral systems</p>
              </div>
              <div className="flex gap-3">
                <Bullet />
                <p className="text-white/80">Copepod and live food cultures</p>
              </div>
              <div className="flex gap-3">
                <Bullet />
                <p className="text-white/80">Pod-dependent species and stability-focused tanks</p>
              </div>
            </div>
          </Card>

          <Card title="Inside Reef Cultures">
            <p className="text-sm text-white/75 leading-relaxed">
              We track process, maintain clean culture practices, and prioritize consistency—so what you receive matches your expectations every time.
            </p>
          </Card>

          <Card title="Subscriptions coming soon">
            <p className="text-sm text-white/75 leading-relaxed">
              We’re building a simple option to automate restocks. Early Access members will be the first to get access when it launches.
            </p>
          </Card>

          <Card>
            <h2 className="text-center text-lg md:text-xl font-semibold tracking-tight text-white">
              Join Early Access before {launchLabel}
            </h2>
            <p className="mt-2 text-center text-sm text-white/70 leading-relaxed">
              Lock in 20% off your first order and get priority access to the first drops.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button href="/auth/signup" className="px-7 text-sm">
                Get Early Access
              </Button>
              <Link
                href="/store"
                className="text-sm text-white/70 hover:text-white underline underline-offset-4"
              >
                Browse the Store
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </Container>
  );
}
