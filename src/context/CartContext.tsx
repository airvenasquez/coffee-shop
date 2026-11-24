"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DrinkOptions,
  getLineKey,
  getUnitPriceAed,
  MenuItem,
} from "@/data/menu";

export interface CartItem {
  lineKey: string;
  item: MenuItem;
  quantity: number;
  options?: DrinkOptions;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
  toastMessage: string | null;
  addItem: (item: MenuItem, options?: DrinkOptions) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  removeItem: (lineKey: string) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
}

const STORAGE_KEY = "kopiloko-cart-v2";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.map((entry: CartItem) => ({
              ...entry,
              lineKey: entry.lineKey || getLineKey(entry.item.id, entry.options),
            }))
          );
        }
      }
    } catch {
      // Ignore malformed localStorage
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items, isHydrated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2200);
  };

  const addItem = (item: MenuItem, options?: DrinkOptions) => {
    const lineKey = getLineKey(item.id, options);
    setItems((prev) => {
      const existing = prev.find((entry) => entry.lineKey === lineKey);
      if (existing) {
        return prev.map((entry) =>
          entry.lineKey === lineKey
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }
      return [...prev, { lineKey, item, quantity: 1, options }];
    });
    showToast(`Added ${item.name} to your bag`);
  };

  const updateQuantity = (lineKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineKey);
      return;
    }
    setItems((prev) =>
      prev.map((entry) =>
        entry.lineKey === lineKey ? { ...entry, quantity } : entry
      )
    );
  };

  const removeItem = (lineKey: string) => {
    setItems((prev) => prev.filter((entry) => entry.lineKey !== lineKey));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (itemId: string) => {
    return items
      .filter((entry) => entry.item.id === itemId)
      .reduce((sum, entry) => sum + entry.quantity, 0);
  };

  const { totalItems, totalPrice } = useMemo(() => {
    return items.reduce(
      (acc, entry) => {
        const unitPrice = getUnitPriceAed(entry.item.priceAed, entry.options);
        return {
          totalItems: acc.totalItems + entry.quantity,
          totalPrice: acc.totalPrice + unitPrice * entry.quantity,
        };
      },
      { totalItems: 0, totalPrice: 0 }
    );
  }, [items]);

  const value: CartContextValue = {
    items,
    totalItems,
    totalPrice,
    isHydrated,
    toastMessage,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-4 top-20 z-50 flex justify-center"
        >
          <div className="rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-cream shadow-lg ring-1 ring-caramel/40">
            ✓ {toastMessage}
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
