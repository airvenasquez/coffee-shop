import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-espresso/10 bg-espresso text-cream pb-24 md:pb-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-serif text-lg font-bold">coffee-shop</p>
          <p className="mt-1 text-sm text-cream/75">
            Open daily 7:00 AM – 10:00 PM · Order ahead &amp; pay at pickup
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-caramel-soft">
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
      </div>
    </footer>
  );
}
