export type MenuCategory = "Hot Coffee" | "Iced Coffee" | "Pastries";

export type DrinkSize = "Regular" | "Large";
export type MilkOption = "Whole Milk" | "Oat Milk" | "Almond Milk";

export interface DrinkOptions {
  size?: DrinkSize;
  milk?: MilkOption;
  extraShot?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  priceAed: number;
  category: MenuCategory;
  description: string;
  emoji: string;
  imageUrl?: string;
  tags?: string[];
  featured?: boolean;
}

export const SIZE_SURCHARGE: Record<DrinkSize, number> = {
  Regular: 0,
  Large: 4,
};

export const MILK_SURCHARGE: Record<MilkOption, number> = {
  "Whole Milk": 0,
  "Oat Milk": 3,
  "Almond Milk": 3,
};

export const EXTRA_SHOT_SURCHARGE = 5;

export function isCustomizableDrink(category: MenuCategory): boolean {
  return category === "Hot Coffee" || category === "Iced Coffee";
}

export function getOptionsSurcharge(options?: DrinkOptions): number {
  if (!options) return 0;
  const sizeAdd = options.size ? SIZE_SURCHARGE[options.size] ?? 0 : 0;
  const milkAdd = options.milk ? MILK_SURCHARGE[options.milk] ?? 0 : 0;
  const shotAdd = options.extraShot ? EXTRA_SHOT_SURCHARGE : 0;
  return sizeAdd + milkAdd + shotAdd;
}

export function getUnitPriceAed(basePriceAed: number, options?: DrinkOptions): number {
  return basePriceAed + getOptionsSurcharge(options);
}

export function getLineKey(itemId: string, options?: DrinkOptions): string {
  if (!options) return itemId;
  const size = options.size ?? "Regular";
  const milk = options.milk ?? "Whole Milk";
  const shot = options.extraShot ? "extra" : "std";
  if (size === "Regular" && milk === "Whole Milk" && shot === "std") {
    return itemId;
  }
  return `${itemId}__${size}__${milk}__${shot}`;
}

export function formatOptionsLabel(options?: DrinkOptions): string {
  if (!options) return "";
  const parts: string[] = [];
  if (options.size && options.size !== "Regular") parts.push(options.size);
  if (options.milk && options.milk !== "Whole Milk") parts.push(options.milk);
  if (options.extraShot) parts.push("+Extra Shot");
  return parts.join(" · ");
}

export function formatAed(amount: number): string {
  return `AED ${amount}`;
}

const MENU_IMAGE_MAP: Record<string, string> = {
  espresso: "/images/menu/espresso.jpg",
  americano: "/images/menu/americano.jpg",
  cappuccino: "/images/menu/cappuccino.jpg",
  "flat-white": "/images/menu/flat-white.jpg",
  "iced-latte": "/images/menu/iced-latte.jpg",
  "cold-brew": "/images/menu/cold-brew.jpg",
  "butter-croissant": "/images/menu/butter-croissant.jpg",
  "chocolate-muffin": "/images/menu/chocolate-muffin.jpg",
};

export function getMenuItemImage(id: string, imageUrl?: string): string {
  return imageUrl || MENU_IMAGE_MAP[id] || "/images/hero-kopiloko.jpg";
}
