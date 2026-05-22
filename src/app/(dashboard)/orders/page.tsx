"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Eye,
  Printer,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Banknote,
  CreditCard,
  Building2,
  QrCode,
  Search,
  ChevronDown,
  Check,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { formatRupiah } from "@/lib/formatCurrency";
import OrderDetailDrawer from "@/components/orders/OrderDetailDrawer";
import { toast } from "sonner";
import { ReceiptContent } from "@/components/pos/ReceiptContent";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

const ITEMS_PER_PAGE = 15;

const formatDateTime = (dateStr: string | Date) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + ", " + date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).replace(":", ".");
};

const PaymentMethodBadge = ({ method }: { method: string }) => {
  const config = {
    cash:          { label: "Cash",          icon: <Banknote  size={12} />, style: "bg-[#F0FDF4] text-[#16A34A]" },
    credit_card:   { label: "Credit Card",   icon: <CreditCard size={12} />, style: "bg-[#EFF6FF] text-[#2563EB]" },
    bank_transfer: { label: "Bank Transfer", icon: <Building2  size={12} />, style: "bg-[#FFF7ED] text-[#EA580C]" },
    qris:          { label: "QRIS",          icon: <QrCode     size={12} />, style: "bg-[#F5F3FF] text-[#7C3AED]" },
  }[method] ?? { label: method, icon: null, style: "bg-[#F3F4F6] text-[#6B7280]" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.style}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

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

export default function OrdersPage() {
  const router = useRouter();

  // State hooks exactly as defined
  const [orders,          setOrders]         = useState<Order[]>([]);
  const [isLoading,       setIsLoading]      = useState(true);
  const [searchQuery,     setSearchQuery]    = useState("");
  const [statusFilter,    setStatusFilter]   = useState("all");
  const [methodFilter,    setMethodFilter]   = useState("all");
  const [dateRange,       setDateRange]      = useState({ from: "", to: "" });
  const [currentPage,     setCurrentPage]    = useState(1);
  const [selectedOrder,   setSelectedOrder]  = useState<Order | null>(null);
  const [dateDropOpen,    setDateDropOpen]   = useState(false);
  const [statusDropOpen,  setStatusDropOpen] = useState(false);
  const [methodDropOpen,  setMethodDropOpen] = useState(false);

  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const pdfReceiptRef = useRef<HTMLDivElement>(null);

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Gagal mengambil data order");
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data order");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter & search logic exactly as defined
  const filteredOrders = orders
    .filter(o => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        o.receiptNo.toLowerCase().includes(q) ||
        (o.customerName || "guest").toLowerCase().includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q));

      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchMethod = methodFilter === "all" || o.paymentMethod === methodFilter;

      const orderDate = new Date(o.createdAt);
      const matchFrom = !dateRange.from || orderDate >= new Date(dateRange.from);
      const matchTo   = !dateRange.to   || orderDate <= new Date(dateRange.to + "T23:59:59");

      return matchSearch && matchStatus && matchMethod && matchFrom && matchTo;
    });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, methodFilter, dateRange]);

  // Summary stats
  const summaryStats = {
    total:     orders.length,
    paid:      orders.filter(o => o.status === "paid").length,
    pending:   orders.filter(o => o.status === "pending").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  // Export CSV function
  const handleExportCSV = () => {
    const headers = [
      "Receipt No", "Customer", "Items", "Subtotal",
      "Tax", "Discount", "Total", "Payment Method", "Status",
      "Cashier", "Date"
    ];

    const rows = filteredOrders.map(o => [
      `#${o.receiptNo}`,
      o.customerName ?? "Guest",
      o.items.map(i => `${i.name} x${i.quantity}`).join(" | "),
      o.subtotal.toString(),
      o.tax.toString(),
      o.discount.toString(),
      o.total.toString(),
      o.paymentMethod,
      o.status,
      o.cashierName ?? "",
      new Date(o.createdAt).toLocaleString("id-ID"),
    ]);

    const csv  = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `zenla-orders-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredOrders.length} order berhasil diexport`);
  };

  // Print Receipt handler
  const handlePrintReceipt = (order: Order) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt #${order.receiptNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            padding: 8mm;
            color: #000;
          }
          .center  { text-align: center; }
          .bold    { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .row     { display: flex; justify-content: space-between; margin: 3px 0; }
          .total   { font-size: 14px; font-weight: bold; }
          .footer  { text-align: center; margin-top: 12px; font-size: 10px; color: #555; }
          @page    { margin: 0; size: 80mm auto; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size:16px; margin-bottom:4px">
          ${(order as any).shopName ?? "Zenla Receipt"}
        </div>
        ${(order as any).shopAddress ? `<div class="center" style="font-size:10px">${(order as any).shopAddress}</div>` : ""}
        <div class="divider"></div>
        <div class="row"><span>No. Struk</span><span>#${order.receiptNo}</span></div>
        <div class="row"><span>Tanggal</span><span>${new Date(order.createdAt).toLocaleString("id-ID")}</span></div>
        <div class="row"><span>Kasir</span><span>${order.cashierName ?? "Admin"}</span></div>
        ${order.customerName ? `<div class="row"><span>Customer</span><span>${order.customerName}</span></div>` : ""}
        <div class="row"><span>Pembayaran</span><span>${order.paymentMethod.replace(/_/g," ").toUpperCase()}</span></div>
        <div class="divider"></div>
        ${order.items.map(item => `
          <div class="row bold"><span>${item.name}</span><span>${formatRupiah(item.subtotal)}</span></div>
          <div style="font-size:10px; color:#555; margin-bottom:4px">${item.quantity} × ${formatRupiah(item.price)}</div>
        `).join("")}
        <div class="divider"></div>
        <div class="row"><span>Subtotal</span><span>${formatRupiah(order.subtotal)}</span></div>
        ${order.tax > 0 ? `<div class="row"><span>Pajak (11%)</span><span>${formatRupiah(order.tax)}</span></div>` : ""}
        ${order.discount > 0 ? `<div class="row"><span>Diskon</span><span>-${formatRupiah(order.discount)}</span></div>` : ""}
        <div class="divider"></div>
        <div class="row total"><span>TOTAL</span><span>${formatRupiah(order.total)}</span></div>
        <div class="footer">
          <div>Terima kasih telah berbelanja!</div>
          <div style="margin-top:4px">Powered by Zenla Receipt</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      toast.error("Popup diblokir browser. Izinkan popup untuk mencetak.");
      return;
    }
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Download PDF handler
  const handleDownloadPDF = async (order: Order) => {
    if (!pdfReceiptRef.current) return;

    const loadingToast = toast.loading("Membuat PDF...");

    try {
      const canvas = await html2canvas(pdfReceiptRef.current, {
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
      pdf.save(`receipt-${order.receiptNo}.pdf`);

      toast.dismiss(loadingToast);
      toast.success("PDF berhasil didownload!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.dismiss(loadingToast);
      toast.error("Gagal membuat PDF");
    }
  };

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ===== PRINT-ONLY AREA ===== */}
      {printOrder && (
        <div className="hidden print-only">
          <div className="receipt-print-content">
            <ReceiptContent
              shopName="Zenla Coffee & Eatery"
              shopAddress="Jl. Sudirman No. 123, Jakarta"
              shopLogo="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=100"
              transactionId={printOrder.receiptNo}
              date={formatDateTime(printOrder.createdAt)}
              cashier={printOrder.cashierName || "Owner"}
              paymentMethod={printOrder.paymentMethod}
              items={printOrder.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal,
                category: "",
                stock: 0,
                isActive: true,
                userId: "",
                createdAt: new Date(),
              }))}
              subtotal={printOrder.subtotal}
              tax={printOrder.tax}
              discount={printOrder.discount}
              total={printOrder.total}
            />
          </div>
        </div>
      )}

      {/* Hidden element for PDF capture */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        {selectedOrder && (
          <div ref={pdfReceiptRef} className="bg-white pdf-capture-container" style={{ background: "#ffffff" }}>
            <ReceiptContent
              shopName="Zenla Coffee & Eatery"
              shopAddress="Jl. Sudirman No. 123, Jakarta"
              shopLogo="https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=100"
              transactionId={selectedOrder.receiptNo}
              date={formatDateTime(selectedOrder.createdAt)}
              cashier={selectedOrder.cashierName || "Owner"}
              paymentMethod={selectedOrder.paymentMethod}
              items={selectedOrder.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal,
                category: "",
                stock: 0,
                isActive: true,
                userId: "",
                createdAt: new Date(),
              }))}
              subtotal={selectedOrder.subtotal}
              tax={selectedOrder.tax}
              discount={selectedOrder.discount}
              total={selectedOrder.total}
            />
          </div>
        )}
      </div>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print-hide">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Riwayat Order</h1>
          <p className="text-sm text-[#6B7280]">Semua transaksi yang diproses kasir</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Custom Date Range Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setDateDropOpen(!dateDropOpen);
                setStatusDropOpen(false);
                setMethodDropOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors justify-between shadow-sm"
            >
              <Calendar size={16} className="text-[#6B7280]" />
              <span>
                {dateRange.from || dateRange.to
                  ? `${dateRange.from || "..."} - ${dateRange.to || "..."}`
                  : "Filter Tanggal"}
              </span>
              <ChevronDown size={16} className="text-[#6B7280]" />
            </button>
            {dateDropOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDateDropOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-xl z-20 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase mb-1">Mulai</label>
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase mb-1">Sampai</label>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    />
                  </div>
                  {(dateRange.from || dateRange.to) && (
                    <button
                      onClick={() => {
                        setDateRange({ from: "", to: "" });
                        setDateDropOpen(false);
                      }}
                      className="w-full py-1.5 text-xs text-red-500 font-semibold hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Hapus Filter Tanggal
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredOrders.length === 0}
            className="bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4338CA] transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-4 print-hide">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={18} />
          <input
            type="text"
            placeholder="Cari Receipt No, customer, atau nama item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => {
              setStatusDropOpen(!statusDropOpen);
              setMethodDropOpen(false);
              setDateDropOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full md:w-auto justify-between shadow-sm capitalize"
          >
            <span>Status: {statusFilter === "all" ? "Semua" : statusFilter}</span>
            <ChevronDown size={16} className="text-[#6B7280]" />
          </button>
          {statusDropOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setStatusDropOpen(false)} />
              <div className="absolute left-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-2xl py-2 shadow-xl z-20">
                {[
                  { value: "all", label: "Semua Status" },
                  { value: "paid", label: "Paid" },
                  { value: "pending", label: "Pending" },
                  { value: "cancelled", label: "Cancelled" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setStatusFilter(item.value);
                      setStatusDropOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between font-medium text-[#374151]"
                  >
                    <span>{item.label}</span>
                    {statusFilter === item.value && <Check size={14} className="text-[#4F46E5]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Method Dropdown */}
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => {
              setMethodDropOpen(!methodDropOpen);
              setStatusDropOpen(false);
              setDateDropOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full md:w-auto justify-between shadow-sm capitalize"
          >
            <span>Metode Bayar: {methodFilter === "all" ? "Semua" : methodFilter.replace("_", " ")}</span>
            <ChevronDown size={16} className="text-[#6B7280]" />
          </button>
          {methodDropOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMethodDropOpen(false)} />
              <div className="absolute left-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-2xl py-2 shadow-xl z-20">
                {[
                  { value: "all", label: "Semua Metode" },
                  { value: "cash", label: "Cash" },
                  { value: "credit_card", label: "Credit Card" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "qris", label: "QRIS" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setMethodFilter(item.value);
                      setMethodDropOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between font-medium text-[#374151]"
                  >
                    <span>{item.label}</span>
                    {methodFilter === item.value && <Check size={14} className="text-[#4F46E5]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex items-center gap-3 mb-6 flex-wrap print-hide">
        {[
          { label: "Total Order",  value: summaryStats.total,     color: "bg-[#EEF2FF] text-[#4F46E5]",  icon: <ClipboardList size={14} /> },
          { label: "Paid",         value: summaryStats.paid,      color: "bg-[#DCFCE7] text-[#16A34A]",  icon: <CheckCircle   size={14} /> },
          { label: "Pending",      value: summaryStats.pending,   color: "bg-[#FEF3C7] text-[#D97706]",  icon: <Clock         size={14} /> },
          { label: "Cancelled",    value: summaryStats.cancelled, color: "bg-[#FEE2E2] text-[#DC2626]",  icon: <XCircle       size={14} /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${color}`}>
            {icon}
            {label}: <span className="font-bold ml-1">{value}</span>
          </div>
        ))}
      </div>

      {/* Main Table/Cards Container */}
      <div className="print-hide">
        {isLoading ? (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl flex flex-col items-center justify-center py-24 shadow-sm">
            <Loader2 className="animate-spin text-[#4F46E5] mb-4" size={40} />
            <p className="text-[#6B7280] font-medium">Memuat data transaksi...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop View Table */}
            <div className="hidden md:block bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      {["Receipt No", "Customer", "Items", "Total", "Metode Bayar", "Tanggal", "Status", "Aksi"].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {paginatedOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                        {/* Receipt No */}
                        <td className="px-5 py-4 w-[140px]">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-sm font-bold text-[#4F46E5] hover:underline font-mono text-left"
                          >
                            #{order.receiptNo}
                          </button>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4 text-sm text-[#374151] w-[180px]">
                          {order.customerName ?? (
                            <span className="text-[#9CA3AF] italic">Guest</span>
                          )}
                        </td>

                        {/* Items */}
                        <td className="px-5 py-4">
                          <div className="text-sm text-[#374151]">
                            {order.items.slice(0, 2).map((item, i) => (
                              <span key={i}>
                                {item.name} ×{item.quantity}
                                {i < Math.min(order.items.length, 2) - 1 ? ", " : ""}
                              </span>
                            ))}
                            {order.items.length > 2 && (
                              <span className="ml-2 text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full font-medium inline-block">
                                +{order.items.length - 2} lainnya
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-5 py-4 text-sm font-bold text-[#111827] font-mono w-[130px]">
                          {formatRupiah(order.total)}
                        </td>

                        {/* Metode Bayar */}
                        <td className="px-5 py-4 w-[140px]">
                          <PaymentMethodBadge method={order.paymentMethod} />
                        </td>

                        {/* Tanggal */}
                        <td className="px-5 py-4 text-sm text-[#6B7280] w-[180px]">
                          {formatDateTime(order.createdAt)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 w-[110px]">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Aksi */}
                        <td className="px-5 py-4 w-[80px]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 hover:bg-[#EEF2FF] rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye size={15} className="text-[#4F46E5]" />
                            </button>
                            <button
                              onClick={() => handlePrintReceipt(order)}
                              className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                              title="Cetak Receipt"
                            >
                              <Printer size={15} className="text-[#6B7280]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View Card List */}
            <div className="block md:hidden space-y-4">
              {paginatedOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm space-y-4 hover:border-[#4F46E5]/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-sm font-bold text-[#4F46E5] hover:underline font-mono"
                      >
                        #{order.receiptNo}
                      </button>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="space-y-2 py-3 border-y border-gray-50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Customer:</span>
                      <span className="font-bold text-[#374151]">
                        {order.customerName ?? <span className="text-[#9CA3AF] italic font-normal">Guest</span>}
                      </span>
                    </div>

                    <div className="flex justify-between items-start text-xs">
                      <span className="text-gray-400 font-medium shrink-0">Items:</span>
                      <span className="text-[#374151] font-medium text-right pl-4">
                        {order.items.slice(0, 2).map((item, i) => (
                          <span key={i}>
                            {item.name} ×{item.quantity}
                            {i < Math.min(order.items.length, 2) - 1 ? ", " : ""}
                          </span>
                        ))}
                        {order.items.length > 2 && (
                          <span className="ml-1 text-[10px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded-full font-bold">
                            +{order.items.length - 2}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Metode Bayar:</span>
                      <PaymentMethodBadge method={order.paymentMethod} />
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-gray-400 font-bold">Total:</span>
                      <span className="text-sm font-bold text-[#111827] font-mono">{formatRupiah(order.total)}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handlePrintReceipt(order)}
                      className="p-2 hover:bg-gray-100 bg-gray-50 text-gray-600 rounded-lg transition-colors"
                      title="Cetak Receipt"
                    >
                      <Printer size={15} />
                    </button>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4F46E5] text-white text-xs font-bold rounded-lg hover:bg-[#4338CA] transition-colors"
                    >
                      <Eye size={13} />
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for both views */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border border-[#E5E7EB] bg-white rounded-3xl shadow-sm">
              <p className="text-sm text-[#6B7280] text-center sm:text-left">
                Menampilkan <span className="font-semibold text-[#111827]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> hingga{" "}
                <span className="font-semibold text-[#111827]">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}
                </span>{" "}
                dari <span className="font-semibold text-[#111827]">{filteredOrders.length}</span> order
              </p>
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex-1 sm:flex-none p-2 border border-[#E5E7EB] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex-1 sm:flex-none p-2 border border-[#E5E7EB] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white border border-[#E5E7EB] rounded-3xl text-center py-24 shadow-sm">
            <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={28} className="text-[#4F46E5]" />
            </div>
            <p className="text-base font-semibold text-[#374151]">
              {searchQuery || statusFilter !== "all" || methodFilter !== "all" || dateRange.from || dateRange.to
                ? "Order tidak ditemukan"
                : "Belum ada order"
              }
            </p>
            <p className="text-sm text-[#6B7280] mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || methodFilter !== "all" || dateRange.from || dateRange.to
                ? "Coba ubah filter atau kata kunci pencarian"
                : "Order akan muncul setelah kasir memproses transaksi pertama"
              }
            </p>
            {!searchQuery && statusFilter === "all" && methodFilter === "all" && !dateRange.from && !dateRange.to && (
              <button
                onClick={() => router.push("/pos")}
                className="mt-4 bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4338CA] transition-colors"
              >
                Buka Kasir
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      <OrderDetailDrawer
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
        handlePrintReceipt={handlePrintReceipt}
        handleDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
}
