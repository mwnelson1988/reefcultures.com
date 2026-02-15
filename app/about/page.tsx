import { Container } from "@/components/Container";

export default function AboutPage() {
  return (
    <Container className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-[rgb(var(--brand-primary))]/15 blur-[180px]" />

      <section className="relative mx-auto max-w-3xl pt-12 pb-16">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl shadow-xl px-8 py-10">

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white text-center">
            About Reef Cultures
          </h1>

          <div className="mt-8 space-y-6 text-sm md:text-base text-white/85 leading-relaxed">

            <p>
              Reef Cultures was founded with a clear mission: to provide
              high-quality live phytoplankton and copepod cultures for serious
              reef hobbyists who demand purity, consistency, and performance.
              Built by reef keepers for reef keepers, our company focuses on
              delivering clean, nutrient-dense marine cultures that support
              thriving saltwater aquariums.
            </p>

            <p>
              We specialize in cultivating live phytoplankton for reef tanks,
              live copepods for saltwater aquariums, and reef nutrition
              solutions designed to enhance coral growth, pod populations, and
              overall ecosystem stability. Every culture is grown under
              controlled conditions using disciplined production methods to
              ensure density, freshness, and reliability.
            </p>

            <p>
              Our phytoplankton supports coral coloration and growth, copepod
              reproduction, filter feeder nutrition, and improved biological
              stability. Our live copepods help reef aquariums maintain natural
              biodiversity, support mandarins and pod-dependent species, and
              strengthen the food chain within your marine system.
            </p>

            <p>
              At Reef Cultures, quality is not optional — it is the standard.
              We focus on clean cultures, proper nutrient balance, and
              consistent harvesting cycles so reef hobbyists receive dependable
              live products every time.
            </p>

            <p>
              As a proud American small business, we firmly support the United
              States, our Military, and Law Enforcement communities.
              Discipline, service, and integrity guide both our cultivation
              practices and our customer relationships. We are grateful to
              those who serve and protect our country, and we operate with the
              same dedication and accountability.
            </p>

            <p>
              Today, Reef Cultures continues to refine our cultivation systems,
              expand production capacity responsibly, and develop new marine
              nutrition solutions. Our long-term vision is to become a trusted
              leader in live reef tank nutrition and aquaculture cultures while
              maintaining the hands-on standards that built our foundation.
            </p>

            <p>
              We believe reef keeping requires precision, patience, and
              responsibility. So does running a business.
            </p>

            <p className="font-semibold text-white text-center pt-4">
              Thank you for supporting Reef Cultures — where clean cultures and
              strong values meet.
            </p>

          </div>
        </div>
      </section>
    </Container>
  );
}
