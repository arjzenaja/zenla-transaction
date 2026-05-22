"use client";

import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { User, UserCog, CreditCard, Printer, Download } from "lucide-react";
import { formatRupiah, formatPaymentMethod } from "@/lib/formatCurrency";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  receiptNo: string;
  customerName: string | null;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "credit_card" | "bank_transfer" | "qris";
  status: "paid" | "pending" | "cancelled";
  cashierName: string | null;
  createdAt: string;
}

interface OrderDetailDrawerProps {
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  handlePrintReceipt: (order: Order) => void;
  handleDownloadPDF: (order: Order) => void;
}

const StatusBadge = ({ status }: { status: string | undefined }) => {
  const config = {
    paid: { label: "Paid", style: "bg-[#DCFCE7] text-[#16A34A]" },
    pending: { label: "Pending", style: "bg-[#FEF3C7] text-[#D97706]" },
    cancelled: { label: "Cancelled", style: "bg-[#FEE2E2] text-[#DC2626]" },
  }[status || "paid"] ?? { label: status, style: "bg-gray-100 text-gray-800" };

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${config.style}`}>
      {config.label}
    </span>
  );
};

export default function OrderDetailDrawer({
  selectedOrder,
  setSelectedOrder,
  handlePrintReceipt,
  handleDownloadPDF,
}: OrderDetailDrawerProps) {
  if (!selectedOrder) return null;

  return (
    <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 flex flex-col border-none bg-white shadow-2xl h-full sticky top-0 z-[100] outline-none">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E7EB] bg-white sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-[#6B7280]">#{selectedOrder.receiptNo}</p>
              <h2 className="text-xl font-bold text-[#111827] mt-0.5">Detail Order</h2>
              <p className="text-sm text-[#6B7280] mt-0.5">
                {new Date(selectedOrder.createdAt).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
            <StatusBadge status={selectedOrder.status} />
          </div>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Info card */}
          <div className="bg-[#F9FAFB] rounded-2xl divide-y divide-[#E5E7EB] overflow-hidden border border-[#E5E7EB]">
            {[
              {
                label: "Customer",
                value: selectedOrder.customerName ?? "—",
                icon: <User size={15} className="text-[#9CA3AF]" />,
              },
              {
                label: "Kasir",
                value: selectedOrder.cashierName ?? "Admin",
                icon: <UserCog size={15} className="text-[#9CA3AF]" />,
              },
              {
                label: "Metode Bayar",
                value: formatPaymentMethod(selectedOrder.paymentMethod ?? ""),
                icon: <CreditCard size={15} className="text-[#9CA3AF]" />,
              },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 bg-[#F9FAFB]">
                <div className="flex items-center gap-2.5">
                  {icon}
                  <span className="text-sm text-[#6B7280]">{label}</span>
                </div>
                <span className="text-sm font-semibold text-[#111827]">{value}</span>
              </div>
            ))}
          </div>

          {/* Item Pesanan */}
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-3">
              Item Pesanan
            </p>
            <div className="space-y-2">
              {selectedOrder.items.map((item) => (
                <div key={item.id}
                  className="flex items-center justify-between bg-white border border-[#E5E7EB]
                             rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{item.name}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {item.quantity} × {formatRupiah(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#111827] font-mono">
                    {formatRupiah(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown total */}
          <div className="bg-[#F9FAFB] rounded-2xl p-4 space-y-2 border border-[#E5E7EB]">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="font-mono text-[#111827] font-semibold">
                {formatRupiah(selectedOrder.subtotal ?? 0)}
              </span>
            </div>
            {(selectedOrder.tax ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Pajak (PPN 11%)</span>
                <span className="font-mono text-[#F59E0B] font-semibold">
                  +{formatRupiah(selectedOrder.tax ?? 0)}
                </span>
              </div>
            )}
            {(selectedOrder.discount ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Diskon</span>
                <span className="font-mono text-[#10B981] font-bold">
                  -{formatRupiah(selectedOrder.discount ?? 0)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-[#E5E7EB]">
              <span className="text-base font-bold text-[#111827]">Total</span>
              <span className="text-lg font-bold text-[#4F46E5] font-mono">
                {formatRupiah(selectedOrder.total ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer buttons — fixed di bawah */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3 bg-white sticky bottom-0 z-10 flex-shrink-0">
          <button
            onClick={() => handlePrintReceipt(selectedOrder)}
            className="flex-1 border border-[#E5E7EB] rounded-xl py-2.5 text-sm font-medium text-[#374151]
                       hover:bg-[#F9FAFB] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer size={15} className="text-[#6B7280]" />
            Cetak Receipt
          </button>
          <button
            onClick={() => handleDownloadPDF(selectedOrder)}
            className="flex-1 bg-[#4F46E5] text-white rounded-xl py-2.5 text-sm font-medium
                       hover:bg-[#4338CA] flex items-center justify-center gap-2 transition-colors shadow-md shadow-indigo-50 cursor-pointer"
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
