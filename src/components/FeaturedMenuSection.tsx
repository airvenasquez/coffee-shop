"use client";

import { useEffect, useState } from "react";
import { MenuItem } from "@/data/menu";
import { MenuItemCard } from "@/components/MenuItemCard";

export function FeaturedMenuSection() {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFeatured() {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load menu.");
        }
        if (active) {
          const items = (data.items as MenuItem[]).filter((item) => item.featured);
          setFeaturedItems(items);
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

    loadFeatured();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((skeleton) => (
          <div
            key={skeleton}
            className="h-44 animate-pulse rounded-2xl border border-espresso/10 bg-white/60 p-5"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 rounded-2xl border border-caramel/30 bg-white/85 p-5 text-sm text-espresso/80">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {featuredItems.map((item) => (
        <MenuItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
