"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartPanel } from "@/components/pos/CartPanel";
import { PaymentDrawer } from "@/components/pos/PaymentDrawer";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatCurrency";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function POSPage() {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items, getTotal } = useCartStore();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const total = getTotal();

  return (
    <div className="h-full pt-6 px-4 sm:px-6 pb-20 lg:pb-6 overflow-hidden flex flex-col animate-in fade-in duration-500">
      {/* Page header spacing */}
      <div className="mb-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">POS / Kasir</p>
      </div>

      <div className="flex-1 flex gap-8 h-full min-h-0">
        {/* Left Panel - Product Grid */}
        <div className="flex-[1.5] min-w-0 h-full">
          <ProductGrid />
        </div>

        {/* Right Panel - Current Order (Desktop only) */}
        <div className="hidden lg:block lg:flex-1 lg:min-w-[380px] lg:h-full">
          <CartPanel onProcessPayment={() => setIsPaymentOpen(true)} />
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0 border-t-0 rounded-t-3xl overflow-hidden">
          <CartPanel 
            onProcessPayment={() => {
              setIsCartOpen(false);
              setIsPaymentOpen(true);
            }}
            isMobile
            onClose={() => setIsCartOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Floating Action Button (FAB) for Mobile Cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-30 lg:hidden">
          <Button
            onClick={() => setIsCartOpen(true)}
            className="w-full h-14 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl text-base font-bold shadow-xl shadow-indigo-100 flex justify-between items-center px-6 animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-lg text-xs font-bold">{totalItems} Items</span>
              <span>Review Order</span>
            </div>
            <span className="font-mono">Rp {formatPrice(total)}</span>
          </Button>
        </div>
      )}

      <PaymentDrawer open={isPaymentOpen} onOpenChange={setIsPaymentOpen} />
    </div>
  );
}

