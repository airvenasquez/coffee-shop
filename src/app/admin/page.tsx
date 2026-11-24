"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { formatAed } from "@/data/menu";

interface AdminOrderItem {
  id: string;
  name: string;
  options_label?: string | null;
  price_aed: number;
  quantity: number;
}

interface AdminOrder {
  id: string;
  order_number: string;
  customer_name: string;
  pickup_time: string;
  items: AdminOrderItem[];
  total_aed: number;
  status: "received" | "preparing" | "ready" | "picked_up";
  created_at: string;
}

interface AdminMenuItem {
  id: string;
  name: string;
  price_aed: number;
  category: string;
  is_available: boolean;
}

const STATUS_LABELS: Record<AdminOrder["status"], string> = {
  received: "Received",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked Up",
};

export default function AdminPage() {
  const [pinInput, setPinInput] = useState("");
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const [tab, setTab] = useState<"orders" | "menu">("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (pin: string) => {
    setLoading(true);
    setError("");
    try {
      const [ordersRes, menuRes] = await Promise.all([
        fetch("/api/admin/orders", {
          headers: { "x-admin-pin": pin },
          cache: "no-store",
        }),
        fetch("/api/admin/menu", {
          headers: { "x-admin-pin": pin },
          cache: "no-store",
        }),
      ]);

      if (ordersRes.status === 401 || menuRes.status === 401) {
        setAdminPin(null);
        throw new Error("Invalid Barista PIN.");
      }

      const ordersData = await ordersRes.json();
      const menuData = await menuRes.json();

      setOrders(ordersData.orders ?? []);
      setMenuItems(menuData.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load barista data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!adminPin) return;
    const interval = setInterval(() => fetchData(adminPin), 6000);
    return () => clearInterval(interval);
  }, [adminPin, fetchData]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = pinInput.trim();
    if (!trimmed) return;
    setAdminPin(trimmed);
    await fetchData(trimmed);
  };

  const updateOrderStatus = async (id: string, status: AdminOrder["status"]) => {
    if (!adminPin) return;
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": adminPin,
      },
      body: JSON.stringify({ id, status }),
    });
    await fetchData(adminPin);
  };

  const toggleAvailability = async (item: AdminMenuItem) => {
    if (!adminPin) return;
    await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-pin": adminPin,
      },
      body: JSON.stringify({ id: item.id, is_available: !item.is_available }),
    });
    await fetchData(adminPin);
  };

  if (!adminPin) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <form
          onSubmit={handleLogin}
          className="rounded-3xl border border-espresso/10 bg-white p-6 shadow-md sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-caramel-dark">
            Kopiloko Staff
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-espresso">
            Barista Portal
          </h1>
          <p className="mt-2 text-sm text-espresso/75">
            Enter the store PIN to manage live pickup orders and menu availability.
          </p>

          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Enter Barista PIN"
            className="mt-4 min-h-12 w-full rounded-xl border border-espresso/20 bg-cream/50 px-4 py-3 text-base text-espresso focus:border-caramel focus:outline-none"
          />

          {error && (
            <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-espresso px-6 py-3 text-sm font-bold text-cream hover:bg-espresso-light"
          >
            {loading ? "Signing in..." : "Unlock Portal"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-caramel-dark">
            Kopiloko Barista Portal
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-espresso">
            Store Operations
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("orders")}
            className={`min-h-10 rounded-xl px-4 py-2 text-sm font-bold ${
              tab === "orders"
                ? "bg-espresso text-cream"
                : "border border-espresso/15 bg-white text-espresso"
            }`}
          >
            Order Queue ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("menu")}
            className={`min-h-10 rounded-xl px-4 py-2 text-sm font-bold ${
              tab === "menu"
                ? "bg-espresso text-cream"
                : "border border-espresso/15 bg-white text-espresso"
            }`}
          >
            Menu Stock
          </button>
        </div>
      </div>

      {tab === "orders" ? (
        <div className="mt-6 space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-espresso/10 bg-white p-8 text-center text-espresso/70">
              No pickup orders yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-espresso/10 bg-white p-5 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif text-xl font-bold text-espresso">
                        #{order.order_number}
                      </span>
                      <span className="rounded-full bg-caramel-soft px-3 py-0.5 text-xs font-bold text-espresso">
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-espresso/80">
                      <span className="font-semibold">{order.customer_name}</span> · Pickup{" "}
                      <span className="font-semibold">{order.pickup_time}</span>
                    </p>
                  </div>

                  <span className="font-serif text-lg font-bold text-espresso">
                    {formatAed(order.total_aed)}
                  </span>
                </div>

                <ul className="mt-3 space-y-1 border-t border-espresso/10 pt-3 text-sm text-espresso/85">
                  {order.items.map((entry, idx) => (
                    <li key={`${entry.id}-${idx}`}>
                      {entry.quantity} × {entry.name}
                      {entry.options_label ? ` (${entry.options_label})` : ""}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(["received", "preparing", "ready", "picked_up"] as const).map(
                    (statusKey) => (
                      <button
                        key={statusKey}
                        type="button"
                        onClick={() => updateOrderStatus(order.id, statusKey)}
                        className={`min-h-9 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                          order.status === statusKey
                            ? "bg-caramel text-cream"
                            : "border border-espresso/15 bg-cream text-espresso hover:bg-cream-dark"
                        }`}
                      >
                        {STATUS_LABELS[statusKey]}
                      </button>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-espresso/10 bg-white p-4 shadow-xs"
            >
              <div>
                <p className="font-serif text-lg font-bold text-espresso">
                  {item.name}
                </p>
                <p className="text-xs text-espresso/70">
                  {item.category} · {formatAed(item.price_aed)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleAvailability(item)}
                className={`min-h-10 rounded-xl px-4 py-2 text-xs font-bold ${
                  item.is_available
                    ? "bg-espresso text-cream"
                    : "border border-red-300 bg-red-50 text-red-700"
                }`}
              >
                {item.is_available ? "In Stock" : "Sold Out"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
