"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CreditCard, Landmark, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/formatCurrency";
import { CartItem } from "@/types";
import { PaymentCreditCard } from "./PaymentCreditCard";
import { PaymentBankTransfer } from "./PaymentBankTransfer";
import { PaymentQRIS } from "./PaymentQRIS";
import { PaymentSuccess } from "./PaymentSuccess";

type PaymentMethod = "credit_card" | "bank_transfer" | "qris" | null;

interface CompletedSnapshot {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customerName?: string | null;
}

export function PaymentDrawer({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [snapshot, setSnapshot] = useState<CompletedSnapshot | null>(null);

  const total = useCartStore((state) => state.getTotal());
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTax = useCartStore((state) => state.getTax);
  const discount = useCartStore((state) => state.discount);
  const customerName = useCartStore((state) => state.customerName);

  const handleComplete = async () => {
    // Snapshot cart values BEFORE any async operation to avoid race conditions
    const currentSubtotal = getSubtotal();
    const currentTax = getTax();
    const currentDiscount = discount;
    const currentTotal = total;
    const currentItems = [...items];
    const currentMethod = method || "cash";
    const currentCustomerName = customerName;

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: currentItems.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            qty: Number(item.quantity)
          })),
          subtotal: Number(currentSubtotal),
          tax: Number(currentTax),
          discount: Number(currentDiscount),
          total: Number(currentTotal),
          paymentMethod: currentMethod,
          cashierName: "Admin",
          customerName: currentCustomerName || null
        })
      });

      if (response.ok) {
        // Save snapshot so PaymentSuccess can display correct values
        // regardless of any subsequent store changes
        setSnapshot({
          items: currentItems,
          subtotal: currentSubtotal,
          tax: currentTax,
          discount: currentDiscount,
          total: currentTotal,
          paymentMethod: currentMethod,
          customerName: currentCustomerName || null
        });
        setIsSuccess(true);
      } else {
        const err = await response.json();
        alert(err.error || "Gagal memproses pembayaran");
      }
    } catch (error) {
      console.error("Payment checkout error:", error);
      alert("Gagal memproses pembayaran");
    }
  };

  const handleNewTransaction = () => {
    clearCart();
    setMethod(null);
    setIsSuccess(false);
    setSnapshot(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 border-none bg-[#F9FAFB]">
        {isSuccess && snapshot ? (
          <PaymentSuccess
            items={snapshot.items}
            subtotal={snapshot.subtotal}
            tax={snapshot.tax}
            discount={snapshot.discount}
            total={snapshot.total}
            paymentMethod={snapshot.paymentMethod}
            customerName={snapshot.customerName}
            onNewTransaction={handleNewTransaction}
          />
        ) : (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 bg-white border-b border-gray-100">
              <SheetTitle className="text-xl font-bold text-[#111827]">Process Payment</SheetTitle>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500 font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-[#4F46E5]">Rp {formatPrice(total)}</span>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6">
              {!method ? (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">Select Payment Method</p>

                  <button
                    onClick={() => setMethod("credit_card")}
                    className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group text-left"
                  >
                    <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827]">Credit / Debit Card</h4>
                      <p className="text-xs text-gray-500 font-medium">Visa, Mastercard, JCB</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod("bank_transfer")}
                    className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group text-left"
                  >
                    <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Landmark size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827]">Bank Transfer</h4>
                      <p className="text-xs text-gray-500 font-medium">BCA, Mandiri, BNI, BRI</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod("qris")}
                    className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-600 hover:shadow-md transition-all group text-left"
                  >
                    <div className="h-12 w-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                      <QrCode size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827]">QRIS Digital Payment</h4>
                      <p className="text-xs text-gray-500 font-medium">Gopay, OVO, Dana, LinkAja</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => setMethod(null)}
                    className="px-0 hover:bg-transparent text-[#4F46E5] font-bold text-sm flex gap-2"
                  >
                    ← Back to selection
                  </Button>

                  {method === "credit_card" && <PaymentCreditCard total={total} onConfirm={handleComplete} />}
                  {method === "bank_transfer" && <PaymentBankTransfer total={total} onConfirm={handleComplete} />}
                  {method === "qris" && <PaymentQRIS total={total} onConfirm={handleComplete} />}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
