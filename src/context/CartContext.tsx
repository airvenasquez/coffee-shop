"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { MenuItem } from "@/data/menu";

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
  addItem: (item: MenuItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
}

const STORAGE_KEY = "coffee-shop-cart-v1";

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
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

  const addItem = (item: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((entry) =>
        entry.item.id === itemId ? { ...entry, quantity } : entry
      )
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((entry) => entry.item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (itemId: string) => {
    return items.find((entry) => entry.item.id === itemId)?.quantity ?? 0;
  };

  const { totalItems, totalPrice } = useMemo(() => {
    return items.reduce(
      (acc, entry) => ({
        totalItems: acc.totalItems + entry.quantity,
        totalPrice: acc.totalPrice + entry.item.priceAed * entry.quantity,
      }),
      { totalItems: 0, totalPrice: 0 }
    );
  }, [items]);

  const value: CartContextValue = {
    items,
    totalItems,
    totalPrice,
    isHydrated,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
