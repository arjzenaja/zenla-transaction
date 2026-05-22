"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Share2 } from "lucide-react";
import { formatPrice } from "@/lib/formatCurrency";
import { ReceiptDrawer } from "./ReceiptDrawer";
import { CartItem } from "@/types";
import { toast } from "sonner";

interface PaymentSuccessProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  onNewTransaction: () => void;
  customerName?: string | null;
}

export function PaymentSuccess({
  items,
  subtotal,
  tax,
  discount,
  total,
  paymentMethod,
  onNewTransaction,
  customerName,
}: PaymentSuccessProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    setTransactionId(Math.floor(Math.random() * 90000 + 10000).toString());
  }, []);

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/receipt/ZN-${transactionId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link receipt disalin!");
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 animate-in zoom-in duration-500">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
             <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping duration-[2000ms]" />
             <CheckCircle2 size={56} className="text-green-500 relative z-10" strokeWidth={2} />
          </div>
          <h2 className="text-3xl font-bold text-[#111827] mb-2">Payment Successful</h2>
          <p className="text-gray-500 font-medium">Transaction #ZN-{transactionId}</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-bold uppercase tracking-wider">Total Paid</span>
            <span className="text-xl font-bold text-[#111827]">Rp {formatPrice(total)}</span>
          </div>
          <div className="h-[1px] bg-gray-50" />
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-bold uppercase tracking-wider">Status</span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase">Success</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-14 rounded-2xl border-gray-200 font-bold gap-2 hover:bg-gray-50"
            onClick={() => setShowReceipt(true)}
          >
            <FileText size={20} />
            View Receipt
          </Button>
          <Button 
            variant="outline" 
            className="h-14 rounded-2xl border-gray-200 font-bold gap-2 hover:bg-gray-50"
            onClick={handleShareLink}
          >
            <Share2 size={20} />
            Share Link
          </Button>
        </div>

        <div className="pt-4">
          <Button 
            onClick={onNewTransaction}
            className="w-full h-14 bg-[#111827] hover:bg-[#1F2937] text-white rounded-2xl text-lg font-bold shadow-xl shadow-gray-200"
          >
            New Transaction
          </Button>
          <button 
            onClick={onNewTransaction}
            className="mt-6 text-sm font-bold text-[#4F46E5] hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <ReceiptDrawer
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        transactionId={`ZN-${transactionId}`}
        items={items}
        subtotal={subtotal}
        tax={tax}
        discount={discount}
        total={total}
        paymentMethod={paymentMethod}
        customerName={customerName}
      />
    </div>
  );
}
