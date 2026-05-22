"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Download as DownloadIcon, 
  Eye, 
  Copy, 
  Trash2, 
  CheckCircle,
  Printer,
  X
} from "lucide-react";
import { formatPrice, formatRupiah, formatDueDate, formatPaymentMethod } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";
import { InvoiceStatusChanger } from "./InvoiceStatusChanger";

interface Invoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerEmail?: string;
  customerAvatar?: string;
  date: string;
  dueDate?: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  notes?: string;
  items?: any; // could be JSON string or parsed array
}

interface InvoiceTableProps {
  invoices: Invoice[];
  onRefresh?: () => void;
}

export function InvoiceTable({ invoices, onRefresh }: InvoiceTableProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Bug 5: Detail States
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Bug 6: Context Menu States
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Delete Dialog States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".menu-trigger") && !target.closest(".menu-content")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Safe helper to parse items from SQLite or memory
  const getParsedItems = (itemsInput: any): { name: string; qty: number; total: number }[] => {
    if (!itemsInput) return [];
    if (typeof itemsInput === "string") {
      try {
        return JSON.parse(itemsInput);
      } catch (e) {
        console.error("Error parsing items:", e);
        return [];
      }
    }
    return Array.isArray(itemsInput) ? itemsInput : [];
  };

  // Handlers
  const handleMarkPaid = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "paid" }),
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error("Failed to update status");
      
      toast.success("Invoice ditandai sebagai Paid");
      router.refresh();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    
    try {
      const response = await fetch(`/api/invoices/${deleteTargetId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete invoice");
      
      toast.success("Invoice berhasil dihapus");
      setShowDeleteDialog(false);
      setDeleteTargetId(null);
      router.refresh();
      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error("Gagal menghapus invoice");
    }
  };

  const handleDuplicate = (invoice: Invoice) => {
    // In a real app, this would open the Create Drawer with prefilled data
    toast.info("Fitur duplikat akan segera hadir");
    // Example: setDuplicateData(invoice); setShowCreateDrawer(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    const parsedItems = getParsedItems(invoice.items);
    const itemsMarkup = parsedItems.length > 0
      ? parsedItems.map(item => `
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #F3F4F6;">${item.name}</td>
            <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #F3F4F6;">${item.qty}</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #F3F4F6;">Rp ${formatPrice(item.total / item.qty)}</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #F3F4F6;">Rp ${formatPrice(item.total)}</td>
          </tr>
        `).join("")
      : `
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #F3F4F6;">Layanan Profesional / Produk</td>
            <td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #F3F4F6;">1</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #F3F4F6;">Rp ${formatPrice(invoice.amount)}</td>
            <td style="padding: 12px 8px; text-align: right; border-bottom: 1px solid #F3F4F6;">Rp ${formatPrice(invoice.amount)}</td>
          </tr>
        `;

    const printContent = `
      <html>
        <head>
          <title>Invoice #${invoice.invoiceNo}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #1F2937;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #4F46E5;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .shop-name {
              font-size: 24px;
              font-weight: 800;
              color: #4F46E5;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: 900;
              text-align: right;
              color: #111827;
            }
            .section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .column {
              width: 45%;
            }
            .label {
              font-size: 10px;
              text-transform: uppercase;
              color: #6B7280;
              font-weight: 700;
              margin-bottom: 4px;
            }
            .value {
              font-size: 14px;
              font-weight: 700;
              color: #111827;
            }
            .meta-text {
              color: #6B7280;
              font-size: 13px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #F9FAFB;
              font-weight: 700;
              color: #374151;
              text-align: left;
              padding: 10px 8px;
              border-bottom: 1px solid #E5E7EB;
            }
            .summary-container {
              display: flex;
              justify-content: flex-end;
            }
            .summary-box {
              width: 40%;
              border-top: 2px solid #E5E7EB;
              padding-top: 10px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .total-row {
              border-top: 1px solid #4F46E5;
              padding-top: 10px;
              margin-top: 10px;
              color: #4F46E5;
              font-weight: 900;
              font-size: 18px;
            }
            .footer {
              margin-top: 60px;
              text-align: center;
              border-top: 1px solid #E5E7EB;
              padding-top: 20px;
              color: #9CA3AF;
              font-size: 11px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="shop-name">Zenla Receipt</div>
              <div class="meta-text">Professional Transaction Management</div>
            </div>
            <div>
              <div class="invoice-title">INVOICE</div>
              <div style="text-align: right;" class="value">#${invoice.invoiceNo}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="column">
              <div class="label">Billed To:</div>
              <div class="value">${invoice.customerName}</div>
              <div class="meta-text">${invoice.customerEmail || "-"}</div>
            </div>
            <div class="column" style="text-align: right;">
              <div style="margin-bottom: 12px;">
                <div class="label">Date Issued:</div>
                <div class="value">${formatDueDate(invoice.date || (invoice as any).createdAt)}</div>
              </div>
              <div>
                <div class="label">Due Date:</div>
                <div class="value">${formatDueDate(invoice.dueDate)}</div>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Item Description</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Price</th>
                <th style="width: 20%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsMarkup}
            </tbody>
          </table>
          
          <div class="summary-container">
            <div class="summary-box">
              <div class="summary-row">
                <span style="color: #6B7280;">Subtotal</span>
                <span style="font-weight: 700;">Rp ${formatPrice(invoice.amount)}</span>
              </div>
              <div class="summary-row">
                <span style="color: #6B7280;">Pajak (0%)</span>
                <span style="font-weight: 700;">Rp 0</span>
              </div>
              <div class="summary-row total-row">
                <span>Total Amount</span>
                <span>Rp ${formatPrice(invoice.amount)}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div>Thank you for your business!</div>
            <div style="margin-top: 4px;">Zenla Receipt - Empowering Your Shop</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) {
      toast.error("Popup diblokir browser. Izinkan popup untuk mencetak.");
      return;
    }
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    const toastId = toast.loading(`Menyiapkan PDF Profesional untuk ${invoice.invoiceNo}...`);
    
    try {
      const parsedInvoice = {
        ...invoice,
        items: getParsedItems(invoice.items)
      };
      
      // Generate professional PDF using @react-pdf/renderer
      const blob = await pdf(<InvoicePDF invoice={parsedInvoice as any} />).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNo}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("PDF Profesional berhasil didownload", { id: toastId });
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Gagal mendownload PDF", { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative">
      <div className="overflow-x-auto scrollbar-hide">
        <Table className="min-w-[800px]">
        <TableHeader className="bg-[#F9FAFB]">
          <TableRow className="hover:bg-transparent border-gray-100">
            <TableHead className="font-bold text-[#111827] h-14 pl-6">Invoice ID</TableHead>
            <TableHead className="font-bold text-[#111827] h-14">Customer</TableHead>
            <TableHead className="font-bold text-[#111827] h-14">Date</TableHead>
            <TableHead className="font-bold text-[#111827] h-14">Amount</TableHead>
            <TableHead className="font-bold text-[#111827] h-14 text-center">Status</TableHead>
            <TableHead className="w-20 h-14 pr-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id} className="hover:bg-[#F9FAFB] transition-colors border-gray-100 group">
              <TableCell className="pl-6 py-4">
                <span className="font-mono text-sm font-bold text-[#4F46E5] hover:underline cursor-pointer">
                  #{inv.invoiceNo}
                </span>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                    <AvatarImage src={inv.customerAvatar} />
                    <AvatarFallback className="bg-gray-50 text-xs font-bold">{inv.customerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-[#111827] leading-none mb-1">{inv.customerName}</p>
                    <p className="text-[11px] text-gray-400 font-medium">{inv.customerEmail}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <p className="text-sm text-gray-600 font-medium">
                  {formatDueDate(inv.date || (inv as any).createdAt)}
                </p>
              </TableCell>
              <TableCell className="py-4">
                <p className="text-sm font-bold text-[#111827]">{formatRupiah(inv.amount)}</p>
              </TableCell>
              <TableCell className="py-4 text-center flex justify-center items-center">
                <InvoiceStatusChanger 
                  invoiceId={inv.id} 
                  currentStatus={inv.status} 
                  onStatusChanged={onRefresh} 
                />
              </TableCell>
              <TableCell className="pr-6 py-4 text-right">
                <div className="flex justify-end gap-1">
                   <button
                    onClick={() => setViewInvoice(inv)}
                    className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors text-gray-400 hover:text-[#4F46E5]"
                    title="Lihat Detail"
                  >
                    <Eye size={16} />
                  </button>
                  
                  {/* Bug 6: Context Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === inv.id ? null : inv.id);
                      }}
                      className="p-2 hover:bg-[#F3F4F6] rounded-lg text-gray-400 hover:text-gray-600 menu-trigger"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {openMenuId === inv.id && (
                      <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl
                                      border border-[#E5E7EB] w-[185px] z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in duration-200 menu-content">
                        <button onClick={() => { setViewInvoice(inv); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[#F9FAFB] flex items-center gap-2 text-gray-700">
                          <Eye size={15} className="text-gray-400" /> Lihat Detail
                        </button>
                        <button onClick={() => { handleDuplicate(inv); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[#F9FAFB] flex items-center gap-2 text-gray-700">
                          <Copy size={15} className="text-gray-400" /> Duplikat
                        </button>
                        <button onClick={() => { handleDownloadPDF(inv); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[#F9FAFB] flex items-center gap-2 text-gray-700">
                          <DownloadIcon size={15} className="text-gray-400" /> Download PDF
                        </button>
                        <button onClick={() => { handlePrintInvoice(inv); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-[#F9FAFB] flex items-center gap-2 text-gray-700">
                          <Printer size={15} className="text-gray-400" /> Cetak Invoice
                        </button>
                        {inv.status === "pending" && (
                          <button onClick={() => { handleMarkPaid(inv.id); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 flex items-center gap-2 text-green-600">
                            <CheckCircle size={15} className="text-green-500" /> Mark as Paid
                          </button>
                        )}
                        <div className="my-1 border-t border-[#E5E7EB]" />
                        <button onClick={() => { setDeleteTargetId(inv.id); setShowDeleteDialog(true); setOpenMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-[#EF4444]">
                          <Trash2 size={15} /> Hapus Invoice
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <Sheet open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <SheetContent side="right" className="bg-white w-full sm:w-[460px] p-0 border-l border-gray-100 shadow-2xl flex flex-col h-full">
          <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between flex-shrink-0">
            <div>
              <p className="text-xs text-[#6B7280]">Invoice Detail</p>
              <h3 className="text-lg font-bold text-[#111827]">#{viewInvoice?.invoiceNo}</h3>
            </div>
            {viewInvoice && (
              <Badge 
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-bold border-none capitalize",
                  viewInvoice.status === "paid" ? "bg-green-100 text-green-700" : 
                  viewInvoice.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                  "bg-red-100 text-red-700"
                )}
              >
                {viewInvoice.status}
              </Badge>
            )}
          </div>

          <div ref={contentRef} className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
            {/* Customer info */}
            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Customer</p>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-white shadow-sm">
                  <AvatarImage src={viewInvoice?.customerAvatar} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                    {viewInvoice?.customerName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-gray-900">{viewInvoice?.customerName}</p>
                  <p className="text-xs text-[#6B7280]">{viewInvoice?.customerEmail}</p>
                </div>
              </div>
            </div>

            {/* Invoice info */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Informasi Pembayaran</p>
              <div className="space-y-3">
                {[
                  { label: "Invoice ID",    value: `#${viewInvoice?.invoiceNo}` },
                  { label: "Tanggal",       value: formatDueDate(viewInvoice?.date || (viewInvoice as any)?.createdAt) },
                  { label: "Jatuh Tempo",   value: formatDueDate(viewInvoice?.dueDate) },
                  { label: "Metode Bayar",  value: formatPaymentMethod(viewInvoice?.paymentMethod ?? "") },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-[#6B7280] font-medium">{label}</span>
                    <span className="font-bold text-[#111827]">{value}</span>
                  </div>
                ))}
              </div>
              {viewInvoice?.notes && (
                <div className="pt-3 border-t border-gray-50">
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Catatan</p>
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2.5 border border-gray-100 font-medium">
                    {viewInvoice.notes}
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="text-sm text-[#6B7280] font-medium">Total Jumlah</span>
                <span className="text-lg font-black text-[#4F46E5]">{formatRupiah(viewInvoice?.amount ?? 0)}</span>
              </div>
            </div>

            {/* Items */}
            {viewInvoice && getParsedItems(viewInvoice.items).length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Item Details</p>
                <div className="space-y-2">
                  {getParsedItems(viewInvoice.items).map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                      </div>
                      <span className="font-bold text-sm">{formatRupiah(item.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="px-6 pt-4 pb-10 border-t border-[#E5E7EB] flex gap-3 flex-shrink-0">
            <button 
              onClick={() => viewInvoice && handlePrintInvoice(viewInvoice)}
              className="flex-1 border border-[#E5E7EB] rounded-xl py-2.5 text-sm font-bold text-gray-700 hover:bg-[#F9FAFB] flex items-center justify-center gap-2 transition-colors"
            >
              <Printer size={15} /> Print
            </button>
            <button 
              onClick={() => viewInvoice && handleDownloadPDF(viewInvoice)}
              className="flex-1 border border-[#E5E7EB] rounded-xl py-2.5 text-sm font-bold text-gray-700 hover:bg-[#F9FAFB] flex items-center justify-center gap-2 transition-colors"
            >
              <DownloadIcon size={15} /> PDF
            </button>
            {viewInvoice?.status === "pending" && (
              <button 
                onClick={() => handleMarkPaid(viewInvoice.id)}
                className="flex-1 bg-[#10B981] text-white rounded-xl py-2.5 text-sm font-bold hover:bg-[#059669] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-100"
              >
                <CheckCircle size={15} /> Mark Paid
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">Hapus Invoice?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Tindakan ini tidak dapat dibatalkan. Invoice ini akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-gray-100 font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl bg-red-500 hover:bg-red-600 font-bold"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

