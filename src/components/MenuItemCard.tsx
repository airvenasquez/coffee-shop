"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  DrinkOptions,
  DrinkSize,
  EXTRA_SHOT_SURCHARGE,
  formatAed,
  getMenuItemImage,
  getUnitPriceAed,
  isCustomizableDrink,
  MenuItem,
  MILK_SURCHARGE,
  MilkOption,
  SIZE_SURCHARGE,
} from "@/data/menu";

interface MenuItemCardProps {
  item: MenuItem;
}

const SIZES: DrinkSize[] = ["Regular", "Large"];
const MILKS: MilkOption[] = ["Whole Milk", "Oat Milk", "Almond Milk"];

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addItem, getItemQuantity, isHydrated } = useCart();
  const quantity = isHydrated ? getItemQuantity(item.id) : 0;
  const imageSrc = getMenuItemImage(item.id, item.imageUrl);
  const customizable = isCustomizableDrink(item.category);

  const [showOptions, setShowOptions] = useState(false);
  const [size, setSize] = useState<DrinkSize>("Regular");
  const [milk, setMilk] = useState<MilkOption>("Whole Milk");
  const [extraShot, setExtraShot] = useState(false);

  const activeOptions: DrinkOptions | undefined = customizable
    ? { size, milk, extraShot }
    : undefined;
  const displayPrice = getUnitPriceAed(item.priceAed, showOptions ? activeOptions : undefined);

  const handleAdd = () => {
    addItem(item, showOptions ? activeOptions : undefined);
  };

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
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-espresso/15" />

        <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-full bg-cream/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-espresso shadow-xs backdrop-blur-sm">
            {item.category}
          </span>
          {item.tags?.slice(0, 1).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-caramel px-2.5 py-1 text-[11px] font-bold text-cream shadow-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="absolute bottom-3.5 right-3.5">
          <span className="inline-flex items-center rounded-full bg-espresso/90 px-3.5 py-1.5 text-sm font-bold tracking-tight text-cream shadow-sm backdrop-blur-sm">
            {formatAed(displayPrice)}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-xl font-bold tracking-tight text-espresso">
              {item.name}
            </h3>
            {quantity > 0 && (
              <span className="shrink-0 rounded-full bg-caramel-soft px-2.5 py-0.5 text-xs font-bold text-espresso">
                {quantity} in bag
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-espresso/70">
            {item.description}
          </p>
        </div>

        {/* Optional Drink Customizer */}
        {customizable && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowOptions((prev) => !prev)}
              className="text-xs font-bold text-caramel-dark underline-offset-4 hover:underline"
            >
              {showOptions ? "Hide customizations ▲" : "Customize size & milk ▼"}
            </button>

            {showOptions && (
              <div className="mt-3 space-y-3 rounded-2xl border border-espresso/10 bg-cream/70 p-3.5 text-xs">
                <div>
                  <span className="font-bold uppercase tracking-wider text-espresso/70">
                    Size
                  </span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`min-h-9 rounded-xl px-2.5 py-1.5 font-semibold transition-colors ${
                          size === s
                            ? "bg-espresso text-cream"
                            : "bg-white text-espresso border border-espresso/15"
                        }`}
                      >
                        {s} {SIZE_SURCHARGE[s] > 0 ? `(+${SIZE_SURCHARGE[s]})` : ""}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold uppercase tracking-wider text-espresso/70">
                    Milk
                  </span>
                  <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                    {MILKS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMilk(m)}
                        className={`min-h-9 rounded-xl px-2 py-1.5 font-semibold transition-colors ${
                          milk === m
                            ? "bg-espresso text-cream"
                            : "bg-white text-espresso border border-espresso/15"
                        }`}
                      >
                        {m.replace(" Milk", "")}{" "}
                        {MILK_SURCHARGE[m] > 0 ? `(+${MILK_SURCHARGE[m]})` : ""}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-xl bg-white px-3 py-2 border border-espresso/10">
                  <span className="font-semibold text-espresso">
                    Extra Espresso Shot (+AED {EXTRA_SHOT_SURCHARGE})
                  </span>
                  <input
                    type="checkbox"
                    checked={extraShot}
                    onChange={(e) => setExtraShot(e.target.checked)}
                    className="h-4 w-4 accent-caramel"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-espresso/8 pt-4">
          <button
            type="button"
            onClick={handleAdd}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-espresso px-4 py-3 text-sm font-bold tracking-wide text-cream transition-all hover:bg-espresso-light active:scale-[0.98]"
          >
            <span>Add to Order</span>
            <span>·</span>
            <span className="text-caramel-soft">{formatAed(displayPrice)}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
