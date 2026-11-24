"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatAed, MenuCategory, MenuItem } from "@/data/menu";
import { MenuItemCard } from "@/components/MenuItemCard";
import { useCart } from "@/context/CartContext";

const CATEGORIES: Array<"All" | MenuCategory> = [
  "All",
  "Hot Coffee",
  "Iced Coffee",
  "Pastries",
];

const QUICK_TAGS = ["Best Seller", "Dairy-Free"] as const;

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<"All" | MenuCategory>("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { totalItems, totalPrice, isHydrated } = useCart();

  useEffect(() => {
    let active = true;

    async function loadMenu() {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load menu.");
        }
        if (active) {
          setMenuItems(data.items as MenuItem[]);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load menu.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMenu();
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      if (selectedTag && !(item.tags ?? []).includes(selectedTag)) {
        return false;
      }
      if (
        query &&
        !item.name.toLowerCase().includes(query) &&
        !item.description.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [menuItems, selectedCategory, selectedTag, searchQuery]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-caramel-dark">
            Freshly Prepared Daily
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-espresso sm:text-4xl">
            Our Menu
          </h1>
          <p className="mt-2 text-sm text-espresso/75 sm:text-base">
            Customize your drink or tap to add directly to your pickup bag.
          </p>
        </div>

        {isHydrated && totalItems > 0 && (
          <Link
            href="/cart"
            className="hidden items-center gap-2 rounded-xl bg-caramel px-5 py-3 text-sm font-bold text-cream shadow-sm transition-colors hover:bg-caramel-dark sm:inline-flex"
          >
            <span>View Cart ({totalItems})</span>
            <span>·</span>
            <span>{formatAed(totalPrice)}</span>
          </Link>
        )}
      </div>

      {/* Search & Quick Dietary Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search espresso, croissant..."
            aria-label="Search menu"
            className="min-h-11 w-full rounded-2xl border border-espresso/15 bg-white px-4 py-2.5 text-sm text-espresso placeholder:text-espresso/45 focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/25"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {QUICK_TAGS.map((tag) => {
            const active = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(active ? null : tag)}
                className={`min-h-10 rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  active
                    ? "bg-caramel text-cream shadow-xs"
                    : "border border-espresso/15 bg-white text-espresso/80 hover:bg-cream-dark"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        className="mt-4 flex gap-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Menu categories"
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCategory(category)}
              className={`min-h-11 shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors active:scale-95 ${
                isSelected
                  ? "bg-espresso text-cream shadow-sm"
                  : "border border-espresso/15 bg-white text-espresso hover:bg-cream-dark"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((skeleton) => (
            <div
              key={skeleton}
              className="h-72 animate-pulse rounded-3xl border border-espresso/10 bg-white/60 p-5"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-800">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-espresso/10 bg-white/80 p-8 text-center">
          <p className="font-serif text-lg font-bold text-espresso">
            No matching items found
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
              setSelectedTag(null);
              setSearchQuery("");
            }}
            className="mt-3 rounded-xl bg-espresso px-4 py-2 text-xs font-bold text-cream"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Mobile Floating Cart Bar above bottom nav */}
      {isHydrated && totalItems > 0 && (
        <div className="fixed inset-x-4 bottom-20 z-40 md:hidden">
          <Link
            href="/cart"
            className="flex min-h-13 items-center justify-between rounded-2xl bg-caramel px-5 py-3.5 text-cream shadow-lg transition-transform active:scale-[0.98]"
          >
            <span className="font-bold">
              View Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
            <span className="rounded-lg bg-espresso/20 px-2.5 py-1 text-sm font-bold">
              {formatAed(totalPrice)} →
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
