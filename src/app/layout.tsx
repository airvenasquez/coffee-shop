import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kopiloko | Specialty Roastery & Express Pickup",
  description:
    "Order handcrafted espresso, slow-steeped iced coffee, and warm butter pastries for quick pay-at-pickup at Kopiloko.",
  openGraph: {
    title: "Kopiloko | Specialty Roastery & Express Pickup",
    description:
      "Small-batch espresso, iced coffee, and fresh pastries. Order ahead and pay at pickup.",
    images: ["/images/hero-kopiloko.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-cream text-espresso">
        <CartProvider>
          <Suspense fallback={<div className="h-17 border-b border-espresso/10 bg-cream" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
