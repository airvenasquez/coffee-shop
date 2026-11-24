import Link from "next/link";
import { KopilokoLogo } from "@/components/KopilokoLogo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-espresso/10 bg-espresso text-cream pb-24 md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div className="flex items-start gap-3">
          <KopilokoLogo className="h-10 w-10 shrink-0 rounded-xl text-espresso-light" />
          <div>
            <p className="font-serif text-lg font-bold">Kopiloko</p>
            <p className="mt-1 text-sm text-cream/75">
              Small-batch specialty coffee &amp; warm pastries. Order ahead and pay at pickup.
            </p>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-bold uppercase tracking-wider text-caramel-soft text-xs">
            Visit the Bar
          </p>
          <p className="mt-2 text-cream/85">Alserkal Avenue, Al Quoz 1, Dubai, UAE</p>
          <p className="mt-1 text-cream/70">Open Daily · 7:00 AM – 10:00 PM</p>
          <a
            href="https://maps.google.com/?q=Alserkal+Avenue+Dubai"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-bold text-caramel-soft underline-offset-4 hover:underline"
          >
            Get Directions →
          </a>
        </div>

        <div className="flex flex-col justify-between gap-4 text-sm sm:items-end">
          <div className="flex flex-wrap gap-4 font-medium text-caramel-soft">
            <Link href="/" className="hover:text-cream">
              Home
            </Link>
            <Link href="/menu" className="hover:text-cream">
              Menu
            </Link>
            <Link href="/cart" className="hover:text-cream">
              Cart
            </Link>
            <Link href="/checkout" className="hover:text-cream">
              Checkout
            </Link>
          </div>
          <Link
            href="/admin"
            className="text-xs font-semibold text-cream/55 transition-colors hover:text-caramel-soft"
          >
            Barista Portal →
          </Link>
        </div>
      </div>
    </footer>
  );
}
