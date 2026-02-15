import Link from "next/link";
import { Container } from "@/components/Container";

type Props = {
  searchParams?: { from?: string; openAt?: string };
};

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function ComingSoonPage({ searchParams }: Props) {
  const from = searchParams?.from || "this section";
  const openAtLabel = formatDate(searchParams?.openAt);
  const sectionLabel =
    from === "store" ? "The Store" : from === "dashboard" ? "The Dashboard" : "This section";

  return (
    <Container className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[rgb(var(--brand-primary))]/12 blur-[190px]" />

      <section className="relative mx-auto max-w-2xl px-4 pt-12 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl shadow-xl px-8 py-10 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Coming Soon
          </h1>

          <p className="mt-3 text-sm md:text-base text-white/75 leading-relaxed">
            {sectionLabel} is not open to the public yet.
          </p>

          {openAtLabel ? (
            <p className="mt-2 text-sm text-white/65">
              Planned opening: <span className="text-white/85 font-medium">{openAtLabel}</span>
            </p>
          ) : null}

          <div className="mt-7 flex items-center justify-center gap-4">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Back to Home
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-xl border border-white/10 bg-[rgb(var(--brand-primary))]/20 px-5 py-3 text-sm font-semibold text-white hover:bg-[rgb(var(--brand-primary))]/25 transition"
            >
              Get Early Access
            </Link>
          </div>
        </div>
      </section>
    </Container>
  );
}
