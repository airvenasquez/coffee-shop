"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { formatAed } from "@/data/menu";

interface TrackedOrderItem {
  id: string;
  name: string;
  options_label?: string | null;
  price_aed: number;
  quantity: number;
}

interface TrackedOrder {
  order_number: string;
  customer_name: string;
  pickup_time: string;
  items: TrackedOrderItem[];
  total_aed: number;
  payment_method: string;
  status: "received" | "preparing" | "ready" | "picked_up";
  created_at: string;
}

const STEPS: Array<{
  key: TrackedOrder["status"];
  label: string;
  desc: string;
}> = [
  { key: "received", label: "Order Received", desc: "Sent to the Kopiloko bar" },
  { key: "preparing", label: "Preparing", desc: "Barista is crafting your order" },
  { key: "ready", label: "Ready for Pickup", desc: "Waiting at the pickup counter" },
  { key: "picked_up", label: "Picked Up", desc: "Enjoy your coffee!" },
];

export default function OrderTrackingPage() {
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const orderNumber = params?.orderNumber ?? "";
  const token = searchParams.get("token") ?? "";

  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderNumber || !token) {
      setError("Invalid tracking link. Missing order number or token.");
      setLoading(false);
      return;
    }

    let active = true;

    async function fetchStatus() {
      try {
        const res = await fetch(
          `/api/orders/${encodeURIComponent(orderNumber)}?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Unable to load order.");
        }
        if (active) {
          setOrder(data.order as TrackedOrder);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load order.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderNumber, token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-espresso/10 bg-white p-8 text-center text-espresso/70">
          Loading live order status...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-espresso">
            Order Not Found
          </h1>
          <p className="mt-2 text-sm text-espresso/75">
            {error || "We couldn't find an order matching this link."}
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-espresso px-6 py-3 text-sm font-bold text-cream"
          >
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-3xl border border-espresso/10 bg-white p-6 shadow-md sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-espresso/10 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-caramel-dark">
              Live Pickup Status
            </p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-espresso">
              Order #{order.order_number}
            </h1>
            <p className="mt-1 text-sm text-espresso/75">
              For <span className="font-semibold text-espresso">{order.customer_name}</span> · Pickup{" "}
              <span className="font-semibold text-espresso">{order.pickup_time}</span>
            </p>
          </div>
          <span className="rounded-full bg-caramel-soft px-3.5 py-1.5 text-xs font-bold text-espresso">
            Auto-updating
          </span>
        </div>

        {/* 4-Step Progress Tracker */}
        <div className="mt-6 space-y-4">
          {STEPS.map((step, idx) => {
            const done = idx <= currentStepIdx;
            const current = idx === currentStepIdx;
            return (
              <div key={step.key} className="flex items-start gap-3.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    done
                      ? "bg-caramel text-cream shadow-xs"
                      : "border border-espresso/20 bg-cream text-espresso/45"
                  }`}
                >
                  {done ? "✓" : idx + 1}
                </span>
                <div className="pt-0.5">
                  <p
                    className={`text-sm font-bold ${
                      current ? "text-caramel-dark" : done ? "text-espresso" : "text-espresso/45"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-espresso/65">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Itemized Summary */}
        <div className="mt-7 rounded-2xl bg-cream-dark/70 p-4 sm:p-5">
          <ul className="space-y-2 text-sm">
            {order.items.map((entry, idx) => (
              <li key={`${entry.id}-${idx}`} className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-espresso">
                    {entry.quantity} × {entry.name}
                  </span>
                  {entry.options_label && (
                    <span className="block text-xs text-caramel-dark">
                      {entry.options_label}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-espresso">
                  {formatAed(entry.price_aed * entry.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-espresso/15 pt-3">
            <span className="font-serif text-base font-bold text-espresso">
              Pay at Pickup
            </span>
            <span className="font-serif text-xl font-bold text-espresso">
              {formatAed(order.total_aed)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/menu"
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-espresso px-6 py-3 text-sm font-bold text-cream"
          >
            Order Another Item
          </Link>
        </div>
      </div>
    </div>
  );
}
