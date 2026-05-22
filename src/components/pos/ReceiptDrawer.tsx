"use client";

import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { X, Printer, Download, Share2 } from "lucide-react";
import { formatPrice as formatRupiah } from "@/lib/formatCurrency";
import { CartItem } from "@/types";
import { toast } from "sonner";
import { ReceiptContent } from "./ReceiptContent";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ReceiptDrawerProps {
  open: boolean;
  onClose: () => void;
  transactionId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashierName?: string;
  shopName?: string;
  shopAddress?: string;
  shopLogo?: string;
  customerName?: string | null;
}

export function ReceiptDrawer({
  open,
  onClose,
  transactionId,
  items,
  subtotal,
  tax,
  discount,
  total,
  paymentMethod,
  cashierName = "Admin Zenla",
  shopName = "Zenla Coffee & Eatery",
  shopAddress = "Jl. Sudirman No. 123, Jakarta",
  shopLogo = "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=100",
  customerName,
}: ReceiptDrawerProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFormattedDate(new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    const loadingToast = toast.loading("Membuat PDF...");

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3, // Premium quality
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 420, // Keep layout size consistent
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
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${transactionId}.pdf`);

      toast.dismiss(loadingToast);
      toast.success("PDF berhasil didownload!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.dismiss(loadingToast);
      toast.error("Gagal membuat PDF");
    }
  };

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/receipt/${transactionId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link receipt berhasil disalin!");
    } catch (err) {
      // Fallback
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Link receipt berhasil disalin!");
      } catch (fallbackErr) {
        toast.error("Gagal menyalin link");
      }
    }
  };

  const receiptData = {
    shopName,
    shopAddress,
    shopLogo,
    transactionId,
    date: formattedDate,
    cashier: cashierName,
    paymentMethod,
    items,
    subtotal,
    tax,
    discount,
    total,
    customerName,
  };

  return (
    <>
      {/* ===== PRINT-ONLY AREA ===== */}
      <div className="hidden print-only">
        <div className="receipt-print-content">
          <ReceiptContent {...receiptData} />
        </div>
      </div>

      {/* ===== NORMAL DRAWER ===== */}
      <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col print-hide">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
            <h2 className="text-lg font-semibold">Receipt Preview</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-[#6B7280]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 flex justify-center">
            <div ref={receiptRef} className="w-full pdf-capture-container">
              <ReceiptContent {...receiptData} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-5 border-t border-[#E5E7EB] bg-white grid grid-cols-3 gap-3">
            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center gap-2 border border-[#E5E7EB] rounded-xl py-3 text-[10px] font-bold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <Printer size={18} /> PRINT
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex flex-col items-center justify-center gap-2 border border-[#E5E7EB] rounded-xl py-3 text-[10px] font-bold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <Download size={18} /> PDF
            </button>
            <button
              onClick={handleShareLink}
              className="flex flex-col items-center justify-center gap-2 border border-[#E5E7EB] rounded-xl py-3 text-[10px] font-bold text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <Share2 size={18} /> SHARE
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
