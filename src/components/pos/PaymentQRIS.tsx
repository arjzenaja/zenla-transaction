"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatCurrency";
import { QrCode } from "lucide-react";

export function PaymentQRIS({ total, onConfirm }: { total: number, onConfirm: () => void }) {
  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-6 bg-white rounded-3xl border-4 border-indigo-50 shadow-2xl relative group">
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
          {/* Simulated QR Code */}
          <div className="h-64 w-64 bg-[#111827] rounded-xl p-4 flex items-center justify-center relative overflow-hidden">
            <QrCode size={200} className="text-white" strokeWidth={1} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-lg shadow-xl border border-gray-100">
              <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">Z</div>
            </div>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Payment Amount</p>
          <h2 className="text-3xl font-bold text-[#111827]">Rp {formatPrice(total)}</h2>
          <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-wider">Joy's Coffee House</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_gopay.svg" alt="Gopay" className="h-5 grayscale opacity-50" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo.svg" alt="OVO" className="h-5 grayscale opacity-50" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana.svg" alt="Dana" className="h-5 grayscale opacity-50" />
        </div>
        
        <p className="text-center text-xs text-gray-400 font-medium px-8 leading-relaxed">
          Scan the QR code with any e-wallet or mobile banking app supporting QRIS (Gopay, OVO, Dana, etc.)
        </p>
      </div>

      <Button 
        onClick={onConfirm}
        className="w-full h-14 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl text-lg font-bold shadow-lg shadow-green-100"
      >
        Already Paid
      </Button>
    </div>
  );
}
