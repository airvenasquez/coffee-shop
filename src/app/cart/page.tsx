"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatAed, getMenuItemImage } from "@/data/menu";

export default function CartPage() {
  const { items, totalItems, totalPrice, isHydrated, updateQuantity, removeItem, clearCart } =
    useCart();

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-espresso/10 bg-white/80 p-8 text-center text-espresso/70">
          Loading your cart...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-caramel-dark">
            Your Order
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-espresso">
            Cart
          </h1>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="min-h-10 rounded-xl border border-espresso/15 px-3.5 py-2 text-xs font-semibold text-espresso/75 transition-colors hover:bg-cream-dark hover:text-espresso"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-espresso/10 bg-white/85 px-6 py-12 text-center shadow-sm">
          <p className="text-4xl" aria-hidden="true">
            ☕
          </p>
          <h2 className="mt-4 font-serif text-xl font-bold text-espresso">
            Your cart is empty
          </h2>
          <p className="mt-2 text-sm text-espresso/75">
            Add an espresso, iced latte, or fresh pastry to get started.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-espresso px-6 py-3 text-sm font-bold text-cream transition-colors hover:bg-espresso-light"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="space-y-3">
            {items.map(({ item, quantity }) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-espresso/10 bg-white/90 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={getMenuItemImage(item.id)}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-xs"
                  />
                  <div>
                    <h2 className="font-serif text-lg font-bold text-espresso">
                      {item.name}
                    </h2>
                    <p className="text-sm text-espresso/70">
                      {formatAed(item.priceAed)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center rounded-xl bg-cream-dark p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg font-bold text-espresso shadow-xs transition-colors hover:bg-caramel-soft active:scale-95"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-espresso">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-caramel text-lg font-bold text-cream shadow-xs transition-colors hover:bg-caramel-dark active:scale-95"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-bold text-espresso">
                      {formatAed(item.priceAed * quantity)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mt-0.5 text-xs font-semibold text-caramel-dark hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Card */}
          <div className="rounded-3xl border border-espresso/15 bg-cream-dark/80 p-5 sm:p-6">
            <div className="flex items-center justify-between text-sm text-espresso/80">
              <span>Items ({totalItems})</span>
              <span>{formatAed(totalPrice)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-espresso/80">
              <span>Payment Method</span>
              <span className="font-semibold text-espresso">Pay at Pickup</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-espresso/15 pt-4">
              <span className="font-serif text-lg font-bold text-espresso">Total</span>
              <span className="font-serif text-2xl font-bold text-espresso">
                {formatAed(totalPrice)}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/checkout"
                className="flex min-h-13 flex-1 items-center justify-center rounded-xl bg-espresso px-6 py-3.5 text-base font-bold text-cream shadow-sm transition-colors hover:bg-espresso-light active:scale-[0.98]"
              >
                Proceed to Checkout →
              </Link>
              <Link
                href="/menu"
                className="flex min-h-13 items-center justify-center rounded-xl border border-espresso/20 bg-white px-5 py-3.5 text-sm font-semibold text-espresso transition-colors hover:bg-cream"
              >
                Add More Items
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
