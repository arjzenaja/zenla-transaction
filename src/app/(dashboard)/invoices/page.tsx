"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  Download, 
  Filter, 
  ChevronDown, 
  FileSearch, 
  Check,
  Printer,
  Download as DownloadIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceStatCards } from "@/components/invoices/InvoiceStatCards";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateInvoiceDrawer } from "@/components/invoices/CreateInvoiceDrawer";



export default function InvoicesPage() {
  const router = useRouter();
  
  // Data State
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bug 2: Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Bug 3: Status States
  const [selectedStatus, setSelectedStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  // Bug 4: Advanced Filter States
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  // Bug 7: Pagination States
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Bug 9: Create Invoice State
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  // Fetch Invoices
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoicesList(data);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedStatus, dateFrom, dateTo, minAmount, maxAmount]);

  const statusOptions = [
    { value: "all",     label: "All Statuses" },
    { value: "paid",    label: "Paid",    color: "text-[#10B981]" },
    { value: "pending", label: "Pending", color: "text-[#F59E0B]" },
    { value: "overdue", label: "Overdue", color: "text-[#EF4444]" },
  ];

  const displayInvoices = invoicesList;

  // Filtering Logic
  const filteredInvoices = displayInvoices.filter((inv) => {
    const q = debouncedQuery.toLowerCase();
    const matchSearch = 
      (inv.invoiceNo || "").toLowerCase().includes(q) ||
      (inv.customerName || "").toLowerCase().includes(q) ||
      (inv.customerEmail || "").toLowerCase().includes(q);
    
    const matchStatus = selectedStatus === "all" || inv.status === selectedStatus;
    
    const matchDateFrom = !dateFrom || new Date(inv.date || inv.createdAt) >= new Date(dateFrom);
    const matchDateTo   = !dateTo   || new Date(inv.date || inv.createdAt) <= new Date(dateTo);
    const matchMinAmt   = !minAmount || inv.amount >= Number(minAmount);
    const matchMaxAmt   = !maxAmount || inv.amount <= Number(maxAmount);

    return matchSearch && matchStatus && matchDateFrom && matchDateTo && matchMinAmt && matchMaxAmt;
  });

  // Bug 7: Pagination Logic
  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Bug 8: Export CSV Logic
  const handleExportCSV = () => {
    const headers = [
      "Invoice ID", "Customer", "Email", "Date",
      "Due Date", "Amount", "Status"
    ];

    const rows = filteredInvoices.map(inv => [
      `#${inv.invoiceNo}`,
      inv.customerName,
      inv.customerEmail ?? "",
      inv.date || new Date(inv.createdAt).toLocaleDateString(),
      inv.dueDate || "",
      inv.amount.toString(),
      inv.status,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zenla-invoices-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${filteredInvoices.length} invoice berhasil diexport`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Invoices</h1>
          <p className="text-sm text-gray-500 font-medium">Create and manage billing for your customers</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportCSV}
            variant="outline" 
            className="rounded-xl border-gray-100 h-11 px-5 font-bold text-gray-600 gap-2"
          >
            <Download size={18} />
            Export CSV
          </Button>
          <Button 
            onClick={() => setShowCreateDrawer(true)}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-indigo-100 flex gap-2"
          >
            <Plus size={20} />
            Create Invoice
          </Button>
        </div>
      </div>

      <InvoiceStatCards invoices={invoicesList} />

      {/* Filters Bar */}
      <div className="relative flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice ID or customer name..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm
                       focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-gray-50/50"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Bug 3: Status Dropdown */}
          <div ref={statusRef} className="relative">
            <button
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-4 py-2.5
                         text-sm bg-white hover:bg-[#F9FAFB] min-w-[150px] justify-between font-medium text-[#374151]"
            >
              <span>{statusOptions.find(s => s.value === selectedStatus)?.label}</span>
              <ChevronDown size={16} className={`text-[#6B7280] transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {statusDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg
                              border border-[#E5E7EB] w-[160px] z-50 overflow-hidden">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedStatus(opt.value as typeof selectedStatus);
                      setStatusDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F9FAFB]
                                flex items-center justify-between
                                ${selectedStatus === opt.value ? "font-semibold text-[#4F46E5]" : "text-[#374151]"}`}
                  >
                    {opt.label}
                    {selectedStatus === opt.value && <Check size={14} className="text-[#4F46E5]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bug 4: Filter Icon and Panel */}
          <div className="relative" ref={filterRef}>
            <Button 
              variant="outline" 
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              className={`h-11 w-11 p-0 rounded-xl border-gray-100 transition-colors ${filterPanelOpen ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "text-gray-500"}`}
            >
              <Filter size={18} />
            </Button>

            {filterPanelOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg
                              border border-[#E5E7EB] w-[340px] z-50 p-5">
                <p className="text-sm font-semibold text-[#111827] mb-4">Filter Invoice</p>

                {/* Date Range */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-[#6B7280] mb-2 block">RENTANG TANGGAL</label>
                  <div className="flex gap-2">
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm" />
                    <span className="self-center text-[#9CA3AF]">â€”</span>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm" />
                  </div>
                </div>

                {/* Amount Range */}
                <div className="mb-5">
                  <label className="text-xs font-medium text-[#6B7280] mb-2 block">RENTANG JUMLAH (RP)</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={minAmount}
                      onChange={e => setMinAmount(e.target.value)}
                      className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm" />
                    <span className="self-center text-[#9CA3AF]">â€”</span>
                    <input type="number" placeholder="Max" value={maxAmount}
                      onChange={e => setMaxAmount(e.target.value)}
                      className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm" />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setDateFrom(""); setDateTo(""); setMinAmount(""); setMaxAmount("") }}
                    className="flex-1 border border-[#E5E7EB] rounded-xl py-2 text-sm hover:bg-[#F9FAFB] font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setFilterPanelOpen(false)}
                    className="flex-1 bg-[#4F46E5] text-white rounded-xl py-2 text-sm hover:bg-[#4338CA] font-medium"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FileSearch size={48} className="mx-auto text-[#D1D5DB] mb-4" />
          <p className="text-base font-semibold text-[#374151]">Tidak ada invoice ditemukan</p>
          <p className="text-sm text-[#6B7280] mt-1">
            Coba kata kunci lain atau ubah filter untuk hasil yang lebih baik.
          </p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchQuery("");
              setSelectedStatus("all");
              setDateFrom("");
              setDateTo("");
              setMinAmount("");
              setMaxAmount("");
            }}
            className="text-indigo-600 font-bold mt-2"
          >
            Reset Semua Filter
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <InvoiceTable invoices={paginatedInvoices} onRefresh={fetchInvoices} />

          {/* Bug 7: Pagination UI */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E7EB]">
            <p className="text-sm text-[#6B7280]">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}â€“{Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} of {filteredInvoices.length} invoices
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                  ${currentPage === 1
                    ? "border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed"
                    : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] cursor-pointer"
                  }`}
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <div key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 py-2 text-sm text-[#9CA3AF]">â€¦</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors
                          ${currentPage === p
                            ? "bg-[#4F46E5] text-white"
                            : "text-[#374151] hover:bg-[#F9FAFB]"
                          }`}
                      >
                        {p}
                      </button>
                    </div>
                  ))
                }
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                  ${currentPage === totalPages
                    ? "border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed"
                    : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] cursor-pointer"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateInvoiceDrawer 
        open={showCreateDrawer} 
        onOpenChange={setShowCreateDrawer} 
        onInvoiceCreated={fetchInvoices}
      />
    </div>
  );
}

