"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatAed } from "@/data/menu";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/menu", label: "Menu", icon: "☕" },
  { href: "/cart", label: "Cart", icon: "🛍️" },
  { href: "/checkout", label: "Checkout", icon: "✅" },
];

export function Navbar() {
  const pathname = usePathname();
  const { totalItems, totalPrice, isHydrated } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-espresso/10 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-espresso transition-opacity hover:opacity-85"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-espresso text-lg text-cream shadow-sm">
              ☕
            </span>
            <div>
              <span className="block font-serif text-xl font-bold tracking-tight text-espresso">
                coffee-shop
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-caramel-dark">
                Fresh Brews &amp; Pickup
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-espresso text-cream shadow-sm"
                      : "text-espresso/80 hover:bg-cream-dark hover:text-espresso"
                  }`}
                >
                  {link.label}
                  {link.href === "/cart" && isHydrated && totalItems > 0 && (
                    <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-caramel px-1.5 py-0.5 text-xs font-bold text-cream">
                      {totalItems}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Quick Cart Pill in Header */}
          <Link
            href="/cart"
            className="flex items-center gap-2 rounded-full bg-espresso px-3.5 py-2 text-xs font-semibold text-cream shadow-sm transition-transform active:scale-95 md:hidden"
            aria-label="View cart"
          >
            <span>🛍️</span>
            <span>{isHydrated ? totalItems : 0}</span>
            {isHydrated && totalPrice > 0 && (
              <span className="border-l border-cream/25 pl-2 text-caramel-soft">
                {formatAed(totalPrice)}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-espresso/15 bg-cream/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex min-h-13 flex-col items-center justify-center rounded-xl px-2 py-1.5 text-xs font-semibold transition-colors active:scale-95 ${
                  isActive
                    ? "bg-espresso text-cream"
                    : "text-espresso/75 hover:bg-cream-dark"
                }`}
              >
                <span className="text-base leading-none">{link.icon}</span>
                <span className="mt-1">{link.label}</span>
                {link.href === "/cart" && isHydrated && totalItems > 0 && (
                  <span
                    className={`absolute right-3 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                      isActive
                        ? "bg-caramel text-cream"
                        : "bg-caramel text-cream"
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
