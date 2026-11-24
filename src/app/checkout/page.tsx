"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CartItem, useCart } from "@/context/CartContext";
import { formatAed } from "@/data/menu";

const PICKUP_PRESETS = [
  "In 10 mins",
  "In 20 mins",
  "In 30 mins",
  "In 45 mins",
];

interface ConfirmedOrder {
  orderNumber: string;
  customerName: string;
  pickupTime: string;
  items: CartItem[];
  totalPrice: number;
}

export default function CheckoutPage() {
  const { items, totalPrice, isHydrated, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [pickupTime, setPickupTime] = useState("In 15 mins");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = customerName.trim();
    const trimmedTime = pickupTime.trim();

    if (!trimmedName) {
      setError("Please enter your name for pickup.");
      return;
    }
    if (!trimmedTime) {
      setError("Please select or enter a pickup time.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty. Add items from the menu first.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: trimmedName,
          pickupTime: trimmedTime,
          items: items.map(({ item, quantity }) => ({
            id: item.id,
            quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to place order.");
      }

      setConfirmedOrder(data as ConfirmedOrder);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-espresso/10 bg-white/80 p-8 text-center text-espresso/70">
          Loading checkout...
        </div>
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-3xl border border-caramel/40 bg-white p-6 shadow-md sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-caramel-soft text-3xl">
              ✅
            </span>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-caramel-dark">
              Order Confirmed
            </p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-espresso">
              Thank you, {confirmedOrder.customerName}!
            </h1>
            <p className="mt-2 text-sm text-espresso/75">
              Your order{" "}
              <span className="font-bold text-espresso">
                #{confirmedOrder.orderNumber}
              </span>{" "}
              will be ready for pickup{" "}
              <span className="font-bold text-espresso">
                {confirmedOrder.pickupTime}
              </span>
              .
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-cream-dark/75 p-4 sm:p-5">
            <div className="flex items-center justify-between border-b border-espresso/10 pb-3 text-sm">
              <span className="text-espresso/75">Payment Method</span>
              <span className="rounded-full bg-espresso px-3 py-1 text-xs font-bold text-cream">
                Pay at Pickup
              </span>
            </div>

            <ul className="mt-3 space-y-2 text-sm">
              {confirmedOrder.items.map(({ item, quantity }) => (
                <li key={item.id} className="flex items-center justify-between">
                  <span className="text-espresso">
                    {quantity} × {item.name}
                  </span>
                  <span className="font-semibold text-espresso">
                    {formatAed(item.priceAed * quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-espresso/15 pt-3">
              <span className="font-serif text-base font-bold text-espresso">
                Amount Due at Counter
              </span>
              <span className="font-serif text-xl font-bold text-espresso">
                {formatAed(confirmedOrder.totalPrice)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/menu"
              className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-espresso px-6 py-3 text-sm font-bold text-cream transition-colors hover:bg-espresso-light"
            >
              Order More
            </Link>
            <Link
              href="/"
              className="flex min-h-12 items-center justify-center rounded-xl border border-espresso/20 bg-cream px-6 py-3 text-sm font-semibold text-espresso transition-colors hover:bg-cream-dark"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-caramel-dark">
          Pickup Details
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-espresso">
          Checkout
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-espresso/10 bg-white/85 px-6 py-12 text-center shadow-sm">
          <p className="text-4xl" aria-hidden="true">
            🛍️
          </p>
          <h2 className="mt-4 font-serif text-xl font-bold text-espresso">
            Nothing in your cart yet
          </h2>
          <p className="mt-2 text-sm text-espresso/75">
            Head over to the menu to pick your drinks and pastries first.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-espresso px-6 py-3 text-sm font-bold text-cream transition-colors hover:bg-espresso-light"
          >
            Go to Menu
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-5">
          {/* Checkout Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-espresso/10 bg-white/90 p-5 shadow-sm sm:p-6 md:col-span-3"
          >
            <div>
              <label
                htmlFor="customer-name"
                className="block text-sm font-bold text-espresso"
              >
                Your Name
              </label>
              <input
                id="customer-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Maya"
                className="mt-2 min-h-12 w-full rounded-xl border border-espresso/20 bg-cream/50 px-4 py-3 text-base text-espresso placeholder:text-espresso/45 focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/30"
              />
            </div>

            <div>
              <label
                htmlFor="pickup-time"
                className="block text-sm font-bold text-espresso"
              >
                Pickup Time
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PICKUP_PRESETS.map((preset) => {
                  const active = pickupTime === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPickupTime(preset)}
                      className={`min-h-11 rounded-xl px-3 py-2 text-xs font-bold transition-colors active:scale-95 ${
                        active
                          ? "bg-caramel text-cream shadow-xs"
                          : "border border-espresso/15 bg-cream text-espresso hover:bg-cream-dark"
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
              <input
                id="pickup-time"
                type="text"
                required
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                placeholder="Or type a time (e.g., 5:30 PM)"
                className="mt-3 min-h-12 w-full rounded-xl border border-espresso/20 bg-cream/50 px-4 py-3 text-base text-espresso placeholder:text-espresso/45 focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/30"
              />
            </div>

            {/* Pay at Pickup Notice */}
            <div className="rounded-2xl border border-caramel/30 bg-caramel-soft/45 p-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xl" aria-hidden="true">
                  🏪
                </span>
                <div>
                  <p className="text-sm font-bold text-espresso">
                    Pay at Pickup
                  </p>
                  <p className="text-xs text-espresso/80">
                    No online payment required. Pay with cash or card when you
                    collect your order.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-13 w-full items-center justify-center rounded-xl bg-espresso px-6 py-3.5 text-base font-bold text-cream shadow-sm transition-colors hover:bg-espresso-light active:scale-[0.98] disabled:opacity-60"
            >
              {submitting
                ? "Placing Order..."
                : `Place Order · ${formatAed(totalPrice)}`}
            </button>
          </form>

          {/* Order Summary Sidebar */}
          <aside className="h-fit rounded-3xl border border-espresso/10 bg-cream-dark/75 p-5 sm:p-6 md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-espresso">
                Order Summary
              </h2>
              <Link
                href="/cart"
                className="text-xs font-bold text-caramel-dark hover:underline"
              >
                Edit Cart
              </Link>
            </div>

            <ul className="mt-4 space-y-2.5 text-sm">
              {items.map(({ item, quantity }) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <span className="text-espresso/90">
                    {quantity} × {item.name}
                  </span>
                  <span className="shrink-0 font-semibold text-espresso">
                    {formatAed(item.priceAed * quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-espresso/15 pt-4">
              <span className="font-serif text-base font-bold text-espresso">
                Total
              </span>
              <span className="font-serif text-xl font-bold text-espresso">
                {formatAed(totalPrice)}
              </span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
