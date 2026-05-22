"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Download, 
  Plus, 
  Eye, 
  Printer, 
  Copy, 
  XCircle,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { formatPrice } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ReceiptDrawer } from "@/components/pos/ReceiptDrawer";
import { CartItem } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function RecentTransactionsTable() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [txToCancel, setTxToCancel] = useState<string | null>(null);
  
  // Fetch transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions");
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);
  
  // Print State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [txToPrint, setTxToPrint] = useState<any>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExportCSV = () => {
    const headers = ["Transaction ID", "Customer", "Email", "Product", "Date", "Amount", "Payment Method", "Status"];
    const rows = transactions.map(t => [
      t.id, t.customer.name, t.customer.email,
      t.product, t.date, t.amount, t.method, t.status
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zenla-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV berhasil didownload");
  };

  const handleNewTransaction = () => {
    router.push("/pos");
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID disalin");
    setOpenMenuId(null);
  };

  const handlePrint = (tx: any) => {
    setTxToPrint(tx);
    setIsReceiptOpen(true);
    setOpenMenuId(null);
  };

  const handleCancelOrder = async () => {
    if (!txToCancel) return;
    
    try {
      const response = await fetch("/api/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: txToCancel, status: "cancelled" }),
      });

      if (response.ok) {
        setTransactions(prev => prev.map(t => t.id === txToCancel ? { ...t, status: "cancelled" } : t));
        toast.success("Transaksi dibatalkan");
      } else {
        toast.error("Gagal membatalkan transaksi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsCancelAlertOpen(false);
      setTxToCancel(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#111827]">Recent Transactions</h3>
          <p className="text-sm text-gray-500 font-medium">Latest sales activity</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="rounded-xl border-gray-200 text-sm font-semibold gap-2 flex-1 sm:flex-none"
          >
            <Download size={18} />
            Export CSV
          </Button>
          <Button 
            onClick={handleNewTransaction}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-sm font-semibold gap-2 flex-1 sm:flex-none"
          >
            <Plus size={18} />
            New Transaction
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl overflow-hidden shadow-sm relative">
        <div className="overflow-x-auto scrollbar-hide">
          <Table className="min-w-[750px]">
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-bold text-[#111827] h-12">Transaction ID</TableHead>
              <TableHead className="font-bold text-[#111827] h-12">Customer</TableHead>
              <TableHead className="font-bold text-[#111827] h-12">Product</TableHead>
              <TableHead className="font-bold text-[#111827] h-12">Date</TableHead>
              <TableHead className="font-bold text-[#111827] h-12">Amount</TableHead>
              <TableHead className="font-bold text-[#111827] h-12 text-center">Status</TableHead>
              <TableHead className="w-12 h-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse border-none">
                  <TableCell className="h-16"><div className="h-4 bg-gray-100 rounded w-2/3" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-gray-100 rounded-full inline-block mr-2" /><div className="h-4 bg-gray-100 rounded w-1/3 inline-block align-middle" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-100 rounded w-3/4" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-100 rounded w-1/3" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-100 rounded w-1/2" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-100 rounded w-12 mx-auto" /></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              ))
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 hover:bg-transparent">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <p className="text-base font-bold text-gray-900">Belum ada transaksi</p>
                      <p className="text-xs text-gray-500 font-medium mt-1">Silakan buka kasir untuk memproses transaksi baru.</p>
                    </div>
                    <Button 
                      onClick={handleNewTransaction}
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold px-4 h-9 shadow-sm"
                    >
                      Buka Kasir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-[#F9FAFB] transition-colors border-none group">
                  <TableCell className="font-mono text-sm font-bold text-[#4F46E5]">{tx.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-gray-200">
                        <AvatarImage src={tx.customer.avatar} />
                        <AvatarFallback className="bg-gray-100 text-[10px]">{tx.customer.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-[#111827] leading-none mb-1">{tx.customer.name}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{tx.customer.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 font-medium">{tx.product}</TableCell>
                  <TableCell className="text-sm text-gray-500 font-medium">{tx.date}</TableCell>
                  <TableCell>
                    <p className="text-sm font-bold text-[#111827]">Rp {formatPrice(tx.amount)}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">{tx.method}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      className={cn(
                        "rounded-lg px-2 py-0.5 text-[10px] font-bold border-none capitalize",
                        tx.status === "paid" ? "bg-green-100 text-green-700" : 
                        tx.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                        "bg-red-100 text-red-700"
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="relative">
                    <div className="flex justify-end pr-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                        className="h-8 w-8 rounded-lg group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all"
                      >
                        <MoreHorizontal size={16} className="text-gray-400" />
                      </Button>
                    </div>

                    {openMenuId === tx.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-12 top-0 mt-2 w-[180px] bg-white rounded-xl shadow-lg border border-[#E5E7EB] z-50 py-1 animate-in fade-in zoom-in duration-200"
                      >
                        <button 
                          onClick={() => { setSelectedTx(tx); setIsDetailOpen(true); setOpenMenuId(null); }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-[#F9FAFB] rounded-lg mx-1"
                        >
                          <Eye size={16} /> View Detail
                        </button>
                        <button 
                          onClick={() => handlePrint(tx)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-[#F9FAFB] rounded-lg mx-1"
                        >
                          <Printer size={16} /> Print Receipt
                        </button>
                        <button 
                          onClick={() => handleCopyId(tx.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-[#F9FAFB] rounded-lg mx-1"
                        >
                          <Copy size={16} /> Copy ID
                        </button>
                        {tx.status === "pending" && (
                          <>
                            <div className="h-px bg-gray-100 my-1 mx-1" />
                            <button 
                              onClick={() => { setTxToCancel(tx.id); setIsCancelAlertOpen(true); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#EF4444] hover:bg-red-50 rounded-lg mx-1"
                            >
                              <XCircle size={16} /> Cancel Order
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Drawer */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-[450px] p-0 border-l-0">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-6 border-b border-gray-100 space-y-1">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl font-bold text-[#111827]">Transaction Detail</SheetTitle>
                <Badge className={cn(
                  "rounded-lg px-2 py-0.5 text-[10px] font-bold border-none capitalize",
                  selectedTx?.status === "paid" ? "bg-green-100 text-green-700" : 
                  selectedTx?.status === "pending" ? "bg-yellow-100 text-yellow-700" : 
                  "bg-red-100 text-red-700"
                )}>
                  {selectedTx?.status}
                </Badge>
              </div>
              <SheetDescription className="text-sm font-medium text-gray-500">
                {selectedTx?.id} · {selectedTx?.date}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer Information</h4>
                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={selectedTx?.customer.avatar} />
                    <AvatarFallback>{selectedTx?.customer.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-[#111827]">{selectedTx?.customer.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{selectedTx?.customer.email}</p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Summary</h4>
                <div className="space-y-4">
                  {selectedTx?.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400">
                          {item.qty}x
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#111827]">{item.name}</p>
                          <p className="text-xs text-gray-500 font-medium">Rp {formatPrice(item.price)} / unit</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-[#111827]">Rp {formatPrice(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Details</h4>
                <div className="space-y-3 bg-[#F9FAFB] p-5 rounded-2xl border border-gray-100">
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span className="text-gray-900">Rp {formatPrice(selectedTx?.amount * 0.9)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Tax (10%)</span>
                    <span className="text-gray-900">Rp {formatPrice(selectedTx?.amount * 0.1)}</span>
                  </div>
                  <div className="h-px bg-gray-200 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#111827]">Total Amount</span>
                    <span className="text-lg font-bold text-[#4F46E5]">Rp {formatPrice(selectedTx?.amount)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase pt-2">
                    <span>Payment Method</span>
                    <span className="text-[#111827]">{selectedTx?.method}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-[#F9FAFB]/50 grid grid-cols-2 gap-3">
              <Button variant="outline" className="rounded-xl border-gray-200" onClick={() => setIsDetailOpen(false)}>
                Close Detail
              </Button>
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl gap-2" onClick={() => handlePrint(selectedTx)}>
                <Printer size={18} /> Print Receipt
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Confirmation */}
      <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-[#111827] flex items-center gap-2">
              <AlertCircle className="text-[#EF4444]" /> Batalkan Transaksi?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium">
              Tindakan ini tidak dapat dibatalkan. Status transaksi akan berubah menjadi "Cancelled".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-gray-200 font-semibold">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelOrder}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl font-semibold"
            >
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt Printer Drawer */}
      {txToPrint && (
        <ReceiptDrawer 
          open={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          transactionId={(txToPrint.id || '').replace('#', '')}
          paymentMethod={txToPrint.method}
          items={(txToPrint.items || []).map((item: any, idx: number) => ({
            id: `${txToPrint.id || 'item'}-${idx}`,
            name: item.name,
            price: item.price,
            quantity: item.qty,
            category: "General",
            stock: 0,
            isActive: true,
            userId: "",
            createdAt: new Date(),
          })) as CartItem[]}
          subtotal={txToPrint.amount * 0.9}
          tax={txToPrint.amount * 0.1}
          discount={0}
          total={txToPrint.amount}
          cashierName="Admin Zenla"
        />
      )}
    </div>
  );
}
