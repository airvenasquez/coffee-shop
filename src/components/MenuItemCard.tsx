"use client";

import { useCart } from "@/context/CartContext";
import { formatAed, MenuItem } from "@/data/menu";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem, updateQuantity, getItemQuantity, isHydrated } = useCart();
  const quantity = isHydrated ? getItemQuantity(item.id) : 0;

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-espresso/10 bg-white/85 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream-dark text-2xl"
              aria-hidden="true"
            >
              {item.emoji}
            </span>
            <div>
              <span className="inline-block rounded-full bg-caramel-soft/70 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-espresso-light">
                {item.category}
              </span>
              <h3 className="mt-1 font-serif text-lg font-bold text-espresso">
                {item.name}
              </h3>
            </div>
          </div>
          <span className="shrink-0 rounded-lg bg-cream-dark px-2.5 py-1 text-sm font-bold text-espresso">
            {formatAed(item.priceAed)}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-espresso/75">
          {item.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-espresso/8">
        {quantity === 0 ? (
          <button
            type="button"
            onClick={() => addItem(item)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-espresso px-4 py-3 text-sm font-semibold text-cream transition-colors hover:bg-espresso-light active:scale-[0.98]"
          >
            <span>+ Add to Cart</span>
          </button>
        ) : (
          <div className="flex min-h-12 items-center justify-between rounded-xl bg-cream-dark p-1">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, quantity - 1)}
              aria-label={`Decrease quantity of ${item.name}`}
              className="flex h-10 w-12 items-center justify-center rounded-lg bg-white text-lg font-bold text-espresso shadow-xs transition-colors hover:bg-caramel-soft active:scale-95"
            >
              −
            </button>
            <span className="text-sm font-bold text-espresso">
              {quantity} in cart
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.id, quantity + 1)}
              aria-label={`Increase quantity of ${item.name}`}
              className="flex h-10 w-12 items-center justify-center rounded-lg bg-caramel text-lg font-bold text-cream shadow-xs transition-colors hover:bg-caramel-dark active:scale-95"
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
