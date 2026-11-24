import Link from "next/link";
import { FeaturedMenuSection } from "@/components/FeaturedMenuSection";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Hero Banner */}
      <section className="overflow-hidden rounded-3xl bg-espresso px-6 py-10 text-cream shadow-lg sm:px-10 sm:py-14">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-caramel/25 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-caramel-soft">
            ✨ Skip the line · Pay at pickup
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            Roasted to perfection, ready when you arrive.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg">
            Welcome to <span className="font-semibold text-caramel-soft">Kopiloko</span>.
            Pick your favorite espresso, iced coffee, or warm pastry, choose your
            pickup time, and pay at the counter.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="flex min-h-13 items-center justify-center rounded-xl bg-caramel px-6 py-3.5 text-base font-bold text-cream shadow-sm transition-colors hover:bg-caramel-dark active:scale-[0.98]"
            >
              Browse Full Menu →
            </Link>
            <Link
              href="/cart"
              className="flex min-h-13 items-center justify-center rounded-xl border border-cream/25 bg-espresso-light px-6 py-3.5 text-base font-semibold text-cream transition-colors hover:bg-cream/10 active:scale-[0.98]"
            >
              View Your Cart
            </Link>
          </div>
        </div>
      </section>

      {/* How Pickup Works */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            step: "1",
            title: "Choose Your Order",
            desc: "Tap to add freshly pulled coffees and warm pastries from our 8-item menu.",
          },
          {
            step: "2",
            title: "Pick a Time",
            desc: "Enter your name and choose when you’ll swing by—ready in as little as 10 minutes.",
          },
          {
            step: "3",
            title: "Pay at Pickup",
            desc: "No online card needed. Just pay by cash or card when you collect at the bar.",
          },
        ].map((card) => (
          <div
            key={card.step}
            className="rounded-2xl border border-espresso/10 bg-cream-dark/65 p-5"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-caramel text-sm font-bold text-cream">
              {card.step}
            </span>
            <h2 className="mt-3 font-serif text-lg font-bold text-espresso">
              {card.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-espresso/75">
              {card.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Featured Favorites */}
      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-caramel-dark">
              Customer Favorites
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-espresso sm:text-3xl">
              Popular Picks
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-sm font-bold text-caramel-dark underline-offset-4 hover:underline"
          >
            See all 8 items →
          </Link>
        </div>

        <FeaturedMenuSection />
      </section>
    </div>
  );
}
