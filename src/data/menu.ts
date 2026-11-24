export type MenuCategory = "Hot Coffee" | "Iced Coffee" | "Pastries";

export interface MenuItem {
  id: string;
  name: string;
  priceAed: number;
  category: MenuCategory;
  description: string;
  emoji: string;
  featured?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "espresso",
    name: "Espresso",
    priceAed: 10,
    category: "Hot Coffee",
    description: "Rich, velvety double shot pulled from freshly roasted Arabica beans.",
    emoji: "☕",
  },
  {
    id: "americano",
    name: "Americano",
    priceAed: 13,
    category: "Hot Coffee",
    description: "Smooth double espresso topped with hot filtered water.",
    emoji: "🫖",
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    priceAed: 17,
    category: "Hot Coffee",
    description: "Balanced espresso, steamed milk, and a thick, creamy microfoam cap.",
    emoji: "🥛",
    featured: true,
  },
  {
    id: "flat-white",
    name: "Flat White",
    priceAed: 18,
    category: "Hot Coffee",
    description: "Double ristretto with silky steamed milk for a bold, smooth finish.",
    emoji: "🤎",
    featured: true,
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    priceAed: 19,
    category: "Iced Coffee",
    description: "Chilled espresso poured over cold milk and crystal-clear ice.",
    emoji: "🧊",
    featured: true,
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    priceAed: 20,
    category: "Iced Coffee",
    description: "Slow-steeped for 18 hours for natural caramel sweetness and low acidity.",
    emoji: "🥤",
  },
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    priceAed: 12,
    category: "Pastries",
    description: "Flaky, golden-baked French pastry layered with cultured butter.",
    emoji: "🥐",
    featured: true,
  },
  {
    id: "chocolate-muffin",
    name: "Chocolate Muffin",
    priceAed: 14,
    category: "Pastries",
    description: "Warm, moist dark cocoa muffin studded with melting chocolate chunks.",
    emoji: "🧁",
  },
];

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

export function getMenuItemImage(id: string): string {
  return MENU_IMAGE_MAP[id] ?? "/images/hero-kopiloko.jpg";
}
