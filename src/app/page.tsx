import Link from "next/link";
import { FeaturedMenuSection } from "@/components/FeaturedMenuSection";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Editorial Luxury Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-espresso text-cream shadow-2xl">
        <div className="grid items-stretch lg:grid-cols-12">
          <div className="relative z-10 flex flex-col justify-between p-7 sm:p-10 lg:col-span-7 lg:p-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-caramel/40 bg-caramel/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-caramel-soft">
                Specialty Roastery &amp; Bar · Pay at Pickup
              </span>
              <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Small-batch espresso, ready when you arrive.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
                Welcome to <span className="font-semibold text-caramel-soft">Kopiloko</span>.
                Single-origin Arabica pulled to order, slow-steeped cold brew, and warm
                butter pastries—reserved on your phone and paid at the bar.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/menu"
                  className="flex min-h-13 items-center justify-center rounded-2xl bg-caramel px-7 py-3.5 text-base font-bold text-cream shadow-md transition-all hover:bg-caramel-dark active:scale-[0.98]"
                >
                  Explore the Menu →
                </Link>
                <Link
                  href="/cart"
                  className="flex min-h-13 items-center justify-center rounded-2xl border border-cream/25 bg-white/5 px-7 py-3.5 text-base font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-white/10 active:scale-[0.98]"
                >
                  View Order Bag
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-cream/15 pt-6 text-xs sm:text-sm">
                <div>
                  <p className="font-serif text-lg font-bold text-caramel-soft sm:text-xl">
                    100%
                  </p>
                  <p className="mt-0.5 text-cream/70">Arabica Beans</p>
                </div>
                <div>
                  <p className="font-serif text-lg font-bold text-caramel-soft sm:text-xl">
                    10 min
                  </p>
                  <p className="mt-0.5 text-cream/70">Express Pickup</p>
                </div>
                <div>
                  <p className="font-serif text-lg font-bold text-caramel-soft sm:text-xl">
                    AED 10+
                  </p>
                  <p className="mt-0.5 text-cream/70">Pay at Counter</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-64 lg:col-span-5 lg:min-h-full">
            <img
              src="/images/hero-kopiloko.jpg"
              alt="Kopiloko espresso bar"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/20 to-transparent lg:bg-gradient-to-r lg:from-espresso lg:via-espresso/25 lg:to-transparent" />
          </div>
        </div>
      </section>

      {/* Three-Pillar Experience */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "Curated Menu",
            desc: "Eight signature hot coffees, slow-steeped iced brews, and flaky French pastries.",
          },
          {
            step: "02",
            title: "Timed to Your Walk",
            desc: "Select a 10-minute or custom pickup window so your cup is freshly poured.",
          },
          {
            step: "03",
            title: "Effortless Pickup",
            desc: "Skip the queue completely and pay by cash or card when you collect.",
          },
        ].map((card) => (
          <div
            key={card.step}
            className="rounded-3xl border border-espresso/10 bg-white/80 p-6 shadow-xs"
          >
            <span className="font-serif text-xs font-bold tracking-[0.2em] text-caramel-dark">
              {card.step}
            </span>
            <h2 className="mt-2 font-serif text-xl font-bold text-espresso">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-espresso/75">
              {card.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Signature Favorites */}
      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-caramel-dark">
              Barista Selections
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-espresso sm:text-4xl">
              Signature Favorites
            </h2>
          </div>
          <Link
            href="/menu"
            className="rounded-full border border-espresso/15 bg-white px-4 py-2 text-sm font-bold text-espresso transition-colors hover:bg-cream-dark"
          >
            All 8 items →
          </Link>
        </div>

        <FeaturedMenuSection />
      </section>
    </div>
  );
}
