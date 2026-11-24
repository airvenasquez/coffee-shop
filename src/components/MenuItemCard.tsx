"use client";

import { useCart } from "@/context/CartContext";
import { formatAed, getMenuItemImage, MenuItem } from "@/data/menu";

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem, updateQuantity, getItemQuantity, isHydrated } = useCart();
  const quantity = isHydrated ? getItemQuantity(item.id) : 0;
  const imageSrc = getMenuItemImage(item.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-espresso/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
      {/* Editorial Photo Header */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-dark">
        <img
          src={imageSrc}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/55 via-transparent to-espresso/15" />

        <div className="absolute left-3.5 top-3.5">
          <span className="inline-flex items-center rounded-full bg-cream/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-espresso shadow-xs backdrop-blur-sm">
            {item.category}
          </span>
        </div>

        <div className="absolute bottom-3.5 right-3.5">
          <span className="inline-flex items-center rounded-full bg-espresso/90 px-3.5 py-1.5 text-sm font-bold tracking-tight text-cream shadow-sm backdrop-blur-sm">
            {formatAed(item.priceAed)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="font-serif text-xl font-bold tracking-tight text-espresso">
            {item.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-espresso/70">
            {item.description}
          </p>
        </div>

        <div className="mt-5 border-t border-espresso/8 pt-4">
          {quantity === 0 ? (
            <button
              type="button"
              onClick={() => addItem(item)}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-espresso px-4 py-3 text-sm font-bold tracking-wide text-cream transition-all hover:bg-espresso-light active:scale-[0.98]"
            >
              <span>Add to Order</span>
              <span className="text-caramel-soft">+</span>
            </button>
          ) : (
            <div className="flex min-h-12 items-center justify-between rounded-2xl border border-caramel/30 bg-cream p-1">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, quantity - 1)}
                aria-label={`Decrease quantity of ${item.name}`}
                className="flex h-10 w-12 items-center justify-center rounded-xl bg-white text-lg font-bold text-espresso shadow-xs transition-colors hover:bg-caramel-soft active:scale-95"
              >
                −
              </button>
              <span className="text-sm font-bold text-espresso">
                {quantity} in bag
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, quantity + 1)}
                aria-label={`Increase quantity of ${item.name}`}
                className="flex h-10 w-12 items-center justify-center rounded-xl bg-caramel text-lg font-bold text-cream shadow-xs transition-colors hover:bg-caramel-dark active:scale-95"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
