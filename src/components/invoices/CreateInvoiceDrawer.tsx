"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { formatRupiah } from "@/lib/formatCurrency";

interface CreateInvoiceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated?: () => void;
}

interface InvoiceItem {
  productId?: string;
  name: string;
  qty: number;
  price: number;
  total: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export function CreateInvoiceDrawer({ open, onOpenChange, onInvoiceCreated }: CreateInvoiceDrawerProps) {
  const router = useRouter();
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState("");
  
  // Dynamic Items state
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: "", qty: 1, price: 0, total: 0 }
  ]);
  
  // Catalog Product State
  const [productsCatalog, setProductsCatalog] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch catalog when drawer opens
  useEffect(() => {
    if (open) {
      const fetchCatalog = async () => {
        try {
          const res = await fetch("/api/products");
          if (res.ok) {
            const data = await res.json();
            setProductsCatalog(data);
          }
        } catch (err) {
          console.error("Gagal mengambil katalog produk:", err);
        }
      };
      fetchCatalog();
    }
  }, [open]);

  // Add a new dynamic item row
  const handleAddItem = () => {
    setItems([...items, { name: "", qty: 1, price: 0, total: 0 }]);
  };

  // Remove a dynamic item row
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.error("Minimal harus ada 1 item di dalam invoice");
      return;
    }
    const newItems = items.filter((_, idx) => idx !== index);
    setItems(newItems);
  };

  // Update item field and auto calculate total
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === "productId") {
      // If a catalog product is chosen, autofill price and name
      if (value === "custom") {
        item.productId = undefined;
        item.name = "";
        item.price = 0;
      } else {
        const product = productsCatalog.find(p => p.id === value);
        if (product) {
          item.productId = product.id;
          item.name = product.name;
          item.price = product.price;
        }
      }
    } else {
      (item as any)[field] = value;
    }

    // Recalculate total for this row
    item.total = item.qty * item.price;
    setItems(newItems);
  };

  // Calculate sum of all items amount
  const calculateTotalAmount = () => {
    return items.reduce((acc, curr) => acc + curr.total, 0);
  };

  const handleCreateInvoice = async () => {
    if (!customerName || !dueDate) {
      toast.error("Lengkapi nama pelanggan dan tanggal jatuh tempo");
      return;
    }

    // Validate that items have descriptions and valid numbers
    const validItems = items.filter(item => item.name.trim() !== "" && item.qty > 0 && item.price >= 0);
    if (validItems.length === 0) {
      toast.error("Tambahkan minimal 1 item dengan deskripsi dan harga yang valid");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Membuat invoice profesional...");

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customerName, 
          customerEmail, 
          amount: calculateTotalAmount(), 
          dueDate: new Date(dueDate).toISOString(), 
          status, 
          notes,
          items: JSON.stringify(validItems.map(it => ({
            name: it.name,
            qty: Number(it.qty),
            total: Number(it.total)
          })))
        }),
      });

      if (!response.ok) throw new Error("Failed to create invoice");

      toast.success("Invoice berhasil dibuat!", { id: toastId });
      onOpenChange(false);
      
      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setDueDate("");
      setStatus("pending");
      setNotes("");
      setItems([{ name: "", qty: 1, price: 0, total: 0 }]);
      
      router.refresh();
      if (onInvoiceCreated) {
        onInvoiceCreated();
      }
    } catch (error) {
      toast.error("Gagal membuat invoice", { id: toastId });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-white w-full sm:w-[540px] p-0 border-l border-gray-100 shadow-2xl flex flex-col h-full z-50">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex-shrink-0 flex justify-between items-center bg-[#F9FAFB]">
          <div>
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" /> Buat Invoice Baru
            </h2>
            <p className="text-sm text-[#6B7280] mt-0.5">Isi detail invoice profesional untuk pelanggan</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer */}
          <div>
            <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block mb-1.5">
              Nama Pelanggan <span className="text-[#EF4444]">*</span>
            </label>
            <input 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Aditya Pratama"
              className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none transition-all bg-white font-medium" 
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block mb-1.5">Email Pelanggan</label>
            <input 
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none transition-all bg-white font-medium" 
            />
          </div>

          {/* Due Date & Initial Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block mb-1.5">
                Jatuh Tempo <span className="text-[#EF4444]">*</span>
              </label>
              <input 
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm
                           focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none transition-all bg-white font-medium" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block mb-1.5">Status Awal</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm
                           focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-white outline-none transition-all font-medium"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-[#111827] uppercase tracking-wider">Item / Rincian Tagihan</label>
              <button 
                type="button" 
                onClick={handleAddItem}
                className="text-xs font-bold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={14} /> Tambah Item
              </button>
            </div>

            <div className="space-y-3.5">
              {items.map((item, index) => (
                <div key={index} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400">ITEM #{index + 1}</span>
                    {items.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Catalog Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Pilih dari Katalog (Opsional)</label>
                    <select
                      value={item.productId || "custom"}
                      onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                    >
                      <option value="custom">-- Custom Item / Lain-lain --</option>
                      {productsCatalog.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - Rp {p.price.toLocaleString("id-ID")}</option>
                      ))}
                    </select>
                  </div>

                  {/* Item Description Name */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 block mb-1">Deskripsi Item *</label>
                    <input
                      type="text"
                      placeholder="e.g. Jasa Konsultasi / Nama Produk"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 font-medium bg-white"
                    />
                  </div>

                  {/* Qty & Price */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(index, "qty", Math.max(1, Number(e.target.value)))}
                        className="w-full border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 font-medium bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 block mb-1">Harga Satuan (Rp)</label>
                      <input
                        type="number"
                        placeholder="Harga"
                        value={item.price || ""}
                        onChange={(e) => handleItemChange(index, "price", Math.max(0, Number(e.target.value)))}
                        className="w-full border border-[#E5E7EB] rounded-lg px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 font-medium bg-white"
                      />
                    </div>
                  </div>

                  <div className="text-right text-xs font-bold text-[#111827]">
                    Total Item: <span className="text-indigo-600">{formatRupiah(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Catatan / Notes */}
          <div className="pt-4 border-t border-gray-100">
            <label className="text-xs font-bold text-[#374151] uppercase tracking-wider block mb-1.5">Catatan Tambahan</label>
            <textarea 
              rows={3} 
              placeholder="Catatan tambahan untuk invoice ini (misal. No Rekening bank)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent resize-none outline-none transition-all bg-white font-medium" 
            />
          </div>
        </div>

        {/* Footer info & buttons */}
        <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-[#374151]">Total Keseluruhan</span>
            <span className="text-lg font-black text-[#4F46E5]">{formatRupiah(calculateTotalAmount())}</span>
          </div>

          <div className="flex gap-3 pb-6">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 border border-[#E5E7EB] bg-white rounded-xl py-3 text-sm
                         font-bold hover:bg-[#F9FAFB] text-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleCreateInvoice}
              className="flex-1 bg-[#4F46E5] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#4338CA] transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Membuat...
                </>
              ) : (
                "Buat Invoice"
              )}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
