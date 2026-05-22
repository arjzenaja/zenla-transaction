import { formatCurrency } from "@/lib/formatCurrency";
import { CartItem } from "@/types";
import { FileCheck2 } from "lucide-react";

interface ReceiptContentProps {
  shopName: string;
  shopAddress: string;
  shopLogo?: string | null;
  transactionId: string;
  date: string;
  cashier: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status?: string;
  customerName?: string | null;
}

export function ReceiptContent({
  shopName,
  shopAddress,
  shopLogo,
  transactionId,
  date,
  cashier,
  paymentMethod,
  items,
  subtotal,
  tax,
  discount,
  total,
  status = "paid",
  customerName,
}: ReceiptContentProps) {
  const getStatusBadge = (statusStr: string) => {
    switch (statusStr.toLowerCase()) {
      case "paid":
        return "text-[#10B981] bg-[#ECFDF5] border border-[#A7F3D0]";
      case "pending":
        return "text-[#F59E0B] bg-[#FEF3C7] border border-[#FDE68A]";
      case "cancelled":
      case "failed":
        return "text-[#EF4444] bg-[#FEF2F2] border border-[#FCA5A5]";
      default:
        return "text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB]";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    if (!method) return "Tunai";
    const methods: Record<string, string> = {
      cash: "Tunai",
      credit_card: "Kartu Kredit",
      bank_transfer: "Transfer Bank",
      qris: "QRIS",
    };
    return methods[method.toLowerCase()] || method.toUpperCase();
  };

  return (
    <div
      className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100
                 w-full max-w-[420px] mx-auto overflow-hidden print:shadow-none
                 print:border-none print:rounded-none relative text-slate-800 font-sans"
    >
      {/* Receipt top decorative border for cash receipt feeling */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 print:hidden" />

      {/* Shop header */}
      <div className="text-center px-6 pt-8 pb-6 border-b border-dashed border-slate-200">
        {shopLogo ? (
          <img
            src={shopLogo}
            alt={shopName}
            className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-4 border-slate-50 shadow-sm"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-xl flex items-center justify-center mx-auto mb-3 border border-indigo-100/50 shadow-inner">
            {shopName.substring(0, 2).toUpperCase()}
          </div>
        )}
        <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
          {shopName}
        </h1>
        {shopAddress && (
          <p className="text-[11px] text-slate-400 mt-1.5 max-w-[240px] mx-auto leading-relaxed">
            {shopAddress}
          </p>
        )}
      </div>

      {/* Status indicator banner */}
      <div className="px-6 py-2.5 bg-slate-50/50 flex items-center justify-between border-b border-dashed border-slate-200 text-[11px]">
        <span className="text-slate-400 font-medium">Status Transaksi</span>
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(status)}`}>
          {status}
        </span>
      </div>

      {/* Transaction metadata */}
      <div className="px-6 py-4 border-b border-dashed border-slate-200 space-y-2.5">
        {[
          { label: "No. Struk", value: `#${transactionId}`, isMono: true },
          { label: "Tanggal", value: date },
          { label: "Kasir", value: cashier },
          customerName ? { label: "Customer", value: customerName } : null,
          { label: "Metode Pembayaran", value: getPaymentMethodLabel(paymentMethod) },
        ].filter(Boolean).map((item) => {
          const { label, value, isMono } = item!;
          return (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-slate-400">{label}</span>
              <span className={`font-semibold text-slate-700 ${isMono ? "font-mono tracking-tight" : ""}`}>
                {value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Items List */}
      <div className="px-6 py-4 border-b border-dashed border-slate-200 space-y-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail Item</p>
        {items && items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex justify-between items-start gap-4 text-xs">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate leading-snug">{item.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="font-bold text-slate-800 font-mono self-start pt-0.5">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-2">Tidak ada item</p>
        )}
      </div>

      {/* Calculations & Summary */}
      <div className="px-6 py-4 border-b border-dashed border-slate-200 space-y-2.5 bg-slate-50/30">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Subtotal</span>
          <span className="font-semibold text-slate-700 font-mono">{formatCurrency(subtotal)}</span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Pajak (PPN 11%)</span>
            <span className="font-semibold text-slate-700 font-mono">+{formatCurrency(tax)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Diskon</span>
            <span className="font-semibold text-emerald-500 font-mono">
              -{formatCurrency(discount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200/80 mt-2 text-slate-800">
          <span>TOTAL</span>
          <span className="text-indigo-600 font-mono tracking-tight text-base">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center px-6 py-6 pb-8 relative">
        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
          <FileCheck2 size={18} />
        </div>
        <p className="text-xs font-bold text-slate-700">Terima Kasih Telah Berbelanja! 🙏</p>
        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-[200px] mx-auto">
          Ini adalah bukti pembayaran digital sah dari {shopName}.
        </p>
        <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-3">
          Powered by Zenla Receipt
        </p>
      </div>

      {/* Bottom receipt serrated edge for realism */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-repeat-x flex justify-between overflow-hidden pointer-events-none opacity-20">
        {Array.from({ length: 42 }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-slate-200 rotate-45 transform origin-top-left -translate-y-1"
          />
        ))}
      </div>
    </div>
  );
}
