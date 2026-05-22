"use client";

import { useState } from "react";
import { Printer, Download, FileCheck2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Props {
  transaction: any;
}

export default function ReceiptClient({ transaction }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("receipt-card");
    if (!element) {
      toast.error("Receipt card element not found");
      return;
    }

    setIsDownloading(true);
    toast.loading("Generating PDF...", { id: "pdf-toast" });

    try {
      // Temporarily add a class or style for higher resolution screenshot
      const canvas = await html2canvas(element, {
        scale: 3, // Premium quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 420, // Lock the width for consistent mobile/desktop rendering
        onclone: (clonedDoc) => {
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            .pdf-capture-container {
              width: 380px !important;
              max-width: 380px !important;
              min-width: 380px !important;
              margin: 0 !important;
              padding: 0 !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              background: #ffffff !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              box-sizing: border-box !important;
            }

            .pdf-capture-container,
            .pdf-capture-container div,
            .pdf-capture-container p,
            .pdf-capture-container span {
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
              box-sizing: border-box !important;
            }

            .pdf-capture-container img {
              display: inline-block !important;
              vertical-align: middle !important;
            }

            .pdf-capture-container .border-dashed {
              border-style: solid !important;
              border-color: #cbd5e1 !important;
              border-width: 0 0 1px 0 !important;
            }

            .pdf-capture-container .flex.justify-between {
              display: block !important;
              width: 100% !important;
              clear: both !important;
              margin-bottom: 8px !important;
            }

            .pdf-capture-container .flex.justify-between::after {
              content: "" !important;
              display: table !important;
              clear: both !important;
            }

            .pdf-capture-container .flex.justify-between > div:first-child,
            .pdf-capture-container .flex.justify-between > span:first-child {
              float: left !important;
              width: 65% !important;
              max-width: 65% !important;
              text-align: left !important;
              display: block !important;
            }

            .pdf-capture-container .flex.justify-between > p:last-child,
            .pdf-capture-container .flex.justify-between > span:last-child {
              float: right !important;
              width: 35% !important;
              max-width: 35% !important;
              text-align: right !important;
              display: block !important;
            }

            .pdf-capture-container .truncate {
              white-space: normal !important;
              overflow: visible !important;
              text-overflow: clip !important;
            }

            .pdf-capture-container .absolute.bottom-0 {
              display: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });

      const imgData = canvas.toDataURL("image/png");

      // Custom paper size: 80mm width (thermal roll receipt standard)
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt-${transaction.receiptNo}.pdf`);

      toast.success("PDF downloaded successfully!", { id: "pdf-toast" });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try again.", { id: "pdf-toast" });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
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
    const methods: Record<string, string> = {
      cash: "Tunai",
      credit_card: "Kartu Kredit",
      bank_transfer: "Transfer Bank",
      qris: "QRIS",
    };
    return methods[method.toLowerCase()] || method.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 select-none relative overflow-x-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10" />

      {/* Top branding */}
      <div className="flex items-center gap-2 mb-8 print:hidden animate-fade-in">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
          <span className="text-white text-sm font-bold tracking-wider">Z</span>
        </div>
        <span className="text-sm font-semibold text-slate-500">
          Powered by <span className="text-indigo-600 font-bold">Zenla Receipt</span>
        </span>
      </div>

      {/* Receipt card */}
      <div
        id="receipt-card"
        className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100
                   w-full max-w-[420px] overflow-hidden print:shadow-none
                   print:border-none print:rounded-none relative pdf-capture-container"
      >
        {/* Receipt top decorative border for cash receipt feeling */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 print:hidden" />

        {/* Shop header */}
        <div className="text-center px-8 pt-8 pb-6 border-b border-dashed border-slate-200">
          {transaction.user.logoUrl ? (
            <img
              src={transaction.user.logoUrl}
              alt={transaction.user.shopName}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-slate-50 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/50 shadow-inner">
              {transaction.user.shopName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
            {transaction.user.shopName}
          </h1>
          {transaction.user.address && (
            <p className="text-xs text-slate-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
              {transaction.user.address}
            </p>
          )}
          {transaction.user.phone && (
            <p className="text-xs text-slate-400 mt-0.5">{transaction.user.phone}</p>
          )}
        </div>

        {/* Status indicator banner */}
        <div className="px-8 py-3 bg-slate-50/50 flex items-center justify-between border-b border-dashed border-slate-200 text-xs">
          <span className="text-slate-400 font-medium">Status Transaksi</span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(transaction.status)}`}>
            {transaction.status}
          </span>
        </div>

        {/* Transaction metadata */}
        <div className="px-8 py-5 border-b border-dashed border-slate-200 space-y-3">
          {[
            { label: "No. Struk", value: `#${transaction.receiptNo}`, isMono: true },
            {
              label: "Tanggal",
              value: new Date(transaction.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            { label: "Kasir", value: transaction.cashierName ?? "Owner" },
            transaction.customerName ? { label: "Customer", value: transaction.customerName } : null,
            { label: "Metode Pembayaran", value: getPaymentMethodLabel(transaction.paymentMethod) },
          ].filter(Boolean).map((item) => {
            const { label, value, isMono } = item!;
            return (
              <div key={label} className="flex justify-between text-xs sm:text-sm">
                <span className="text-slate-400">{label}</span>
                <span className={`font-semibold text-slate-700 ${isMono ? "font-mono tracking-tight" : ""}`}>
                  {value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Items List */}
        <div className="px-8 py-5 border-b border-dashed border-slate-200 space-y-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Detail Item</p>
          {transaction.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate leading-snug">{item.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="text-sm font-bold text-slate-800 font-mono self-start pt-0.5">
                {formatCurrency(item.subtotal)}
              </p>
            </div>
          ))}
        </div>

        {/* Calculations & Summary */}
        <div className="px-8 py-5 border-b border-dashed border-slate-200 space-y-3 bg-slate-50/30">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="font-semibold text-slate-700 font-mono">{formatCurrency(transaction.subtotal)}</span>
          </div>

          {transaction.tax > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Pajak (PPN 11%)</span>
              <span className="font-semibold text-slate-700 font-mono">+{formatCurrency(transaction.tax)}</span>
            </div>
          )}

          {transaction.discount > 0 && (
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-400">Diskon</span>
              <span className="font-semibold text-emerald-500 font-mono">
                -{formatCurrency(transaction.discount)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-base font-extrabold pt-3 border-t border-slate-200/80 mt-3 text-slate-800">
            <span>TOTAL</span>
            <span className="text-indigo-600 font-mono tracking-tight text-lg">
              {formatCurrency(transaction.total)}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center px-8 py-8 relative">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <FileCheck2 size={20} />
          </div>
          <p className="text-sm font-bold text-slate-700">Terima Kasih Telah Berbelanja! 🙏</p>
          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed max-w-[240px] mx-auto">
            Ini adalah bukti pembayaran digital sah dari {transaction.user.shopName}.
          </p>
        </div>

        {/* Bottom receipt serrated edge for realism */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-repeat-x flex justify-between overflow-hidden pointer-events-none opacity-20">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-slate-200 rotate-45 transform origin-top-left -translate-y-1.5"
            />
          ))}
        </div>
      </div>

      {/* Action buttons — hidden during print */}
      <div className="flex gap-4 mt-8 print:hidden animate-fade-in">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-slate-200 bg-white
                     rounded-2xl px-6 py-3.5 text-sm font-semibold text-slate-600 hover:text-slate-800
                     hover:bg-slate-100/50 hover:border-slate-300 active:scale-95
                     transition-all shadow-sm"
        >
          <Printer size={18} className="text-slate-400" />
          Cetak Struk
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-indigo-600 text-white
                     rounded-2xl px-6 py-3.5 text-sm font-semibold hover:bg-indigo-700
                     active:scale-95 transition-all shadow-md shadow-indigo-100
                     disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          Unduh PDF
        </button>
      </div>

      {/* Footer copyright */}
      <p className="text-xs text-slate-400 mt-10 print:hidden animate-fade-in">
        © {new Date().getFullYear()} Zenla Receipt. Semua Hak Dilindungi.
      </p>
    </div>
  );
}
