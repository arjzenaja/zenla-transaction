"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatCurrency";

export function PaymentCreditCard({ total, onConfirm }: { total: number, onConfirm: () => void }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="h-12 rounded-xl" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cardName">Cardholder Name</Label>
          <Input id="cardName" placeholder="e.g. Aditya Pratama" className="h-12 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input id="expiry" placeholder="MM/YY" className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv">CVV</Label>
            <Input id="cvv" placeholder="123" className="h-12 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <p className="text-xs text-blue-600 font-medium leading-relaxed">
          Your transaction is secured with end-to-end encryption. Zenla Receipt does not store your full card details.
        </p>
      </div>

      <Button 
        onClick={onConfirm}
        className="w-full h-14 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl text-lg font-bold"
      >
        Pay Rp {formatPrice(total)}
      </Button>
    </div>
  );
}
