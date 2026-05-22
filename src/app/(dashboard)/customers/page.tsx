"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, Search, Filter, Download, 
  ExternalLink, UserSearch, Mail, Phone 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatCurrency";
import { CustomerStatCards } from "@/components/customers/CustomerStatCards";
import { RegisterCustomerDrawer } from "@/components/customers/RegisterCustomerDrawer";
import { CustomerDetailDrawer } from "@/components/customers/CustomerDetailDrawer";

export default function CustomersPage() {
  // Data State
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Filter State
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedStatus,  setSelectedStatus]  = useState("all");
  const [minSpend,        setMinSpend]        = useState("");
  const [maxSpend,        setMaxSpend]        = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  // Drawer State
  const [showRegisterDrawer, setShowRegisterDrawer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch Data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data customer");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Close on outside click for filter panel
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter customer logic
  const filteredCustomers = customers.filter((c) => {
    const q = debouncedQuery.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false) ||
      (c.phone?.includes(q) ?? false);
    
    const matchStatus = selectedStatus === "all" || c.status === selectedStatus;
    const matchMinSpend = !minSpend || c.totalSpend >= Number(minSpend);
    const matchMaxSpend = !maxSpend || c.totalSpend <= Number(maxSpend);
    
    return matchSearch && matchStatus && matchMinSpend && matchMaxSpend;
  });

  // Export Logic
  const handleExport = () => {
    const headers = [
      "Nama", "Email", "Telepon", "Member Sejak",
      "Transaksi", "Total Belanja", "Status"
    ];

    const rows = filteredCustomers.map(c => [
      c.name,
      c.email ?? "",
      c.phone ?? "",
      c.createdAt ? new Date(c.createdAt).toLocaleDateString("id-ID") : "",
      (c.visitCount ?? 0).toString(),
      (c.totalSpend ?? 0).toString(),
      c.status,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `zenla-customers-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${filteredCustomers.length} customer berhasil diexport`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setMinSpend("");
    setMaxSpend("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Customer Directory</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your relationships and loyalty programs</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-4 py-2.5
                       text-sm bg-white hover:bg-[#F9FAFB] font-medium transition-colors"
          >
            <Download size={16} className="text-[#6B7280]" />
            Export
          </button>
          <button 
            onClick={() => setShowRegisterDrawer(true)}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all"
          >
            <Plus size={20} />
            Register New Customer
          </button>
        </div>
      </div>

      <CustomerStatCards customers={customers} />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm
                       focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-white outline-none"
          />
        </div>
        
        <div ref={filterRef} className="relative">
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border transition-colors font-bold
              ${filterPanelOpen
                ? "bg-[#EEF2FF] border-[#4F46E5] text-[#4F46E5]"
                : "bg-white border-[#E5E7EB] text-gray-600 hover:bg-[#F9FAFB]"
              }`}
          >
            <Filter size={15} />
            Filter
            {(selectedStatus !== "all" || minSpend || maxSpend) && (
              <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
            )}
          </button>

          {filterPanelOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl
                            border border-[#E5E7EB] w-[300px] z-50 p-5">
              <p className="text-sm font-semibold text-[#111827] mb-4">Filter Customer</p>

              {/* Status */}
              <div className="mb-4">
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2 block">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all",      label: "Semua",   color: "" },
                    { value: "active",   label: "Active",   color: "bg-green-100 text-green-700" },
                    { value: "inactive", label: "Inactive", color: "bg-yellow-100 text-yellow-700" },
                    { value: "churned",  label: "Churned",  color: "bg-red-100 text-red-700" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedStatus(opt.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
                        ${selectedStatus === opt.value
                          ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                          : `border-[#E5E7EB] ${opt.color || "text-[#374151]"} hover:border-[#4F46E5]`
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Spend Range */}
              <div className="mb-5">
                <label className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2 block">
                  Total Belanja (Rp)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minSpend}
                    onChange={e => setMinSpend(e.target.value)}
                    className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm
                               focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none"
                  />
                  <span className="text-[#9CA3AF]">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxSpend}
                    onChange={e => setMaxSpend(e.target.value)}
                    className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm
                               focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 border border-[#E5E7EB] rounded-xl py-2 text-sm hover:bg-[#F9FAFB] font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={() => setFilterPanelOpen(false)}
                  className="flex-1 bg-[#4F46E5] text-white rounded-xl py-2 text-sm hover:bg-[#4338CA] font-medium transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customers Table (Desktop View) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-[#F9FAFB]">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="font-bold text-[#111827] h-14 pl-6">Customer</TableHead>
              <TableHead className="font-bold text-[#111827] h-14">Contact Info</TableHead>
              <TableHead className="font-bold text-[#111827] h-14 text-center">Transactions</TableHead>
              <TableHead className="font-bold text-[#111827] h-14">Total Spend</TableHead>
              <TableHead className="font-bold text-[#111827] h-14 text-center">Status</TableHead>
              <TableHead className="w-16 h-14 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-[#F9FAFB] transition-colors border-gray-100 group">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-100 shadow-sm">
                        <AvatarImage src={customer.avatarUrl} />
                        <AvatarFallback className="bg-gray-50 text-xs font-bold">{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-[#111827] leading-none mb-1">{customer.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Member since {customer.createdAt ? new Date(customer.createdAt).getFullYear() : "2023"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <Mail size={12} className="text-gray-400" />
                        {customer.email || "—"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                        <Phone size={12} className="text-gray-400" />
                        {customer.phone || "—"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <span className="text-sm font-bold text-[#111827]">{customer.visitCount ?? 0}</span>
                  </TableCell>
                  <TableCell className="py-4">
                    <p className="text-sm font-bold text-[#111827]">Rp {formatPrice(customer.totalSpend ?? 0)}</p>
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <Badge 
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[10px] font-bold border-none capitalize shadow-sm",
                        customer.status === "active" ? "bg-green-100 text-green-700" : 
                        customer.status === "inactive" ? "bg-yellow-100 text-yellow-700" : 
                        "bg-red-100 text-red-700"
                      )}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="p-1.5 hover:bg-[#EEF2FF] rounded-lg transition-colors group"
                      title="Lihat detail customer"
                    >
                      <ExternalLink size={15} className="text-[#6B7280] group-hover:text-[#4F46E5]" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24">
                  <div className="text-center py-20">
                    <UserSearch size={44} className="mx-auto text-[#D1D5DB] mb-3" />
                    <p className="text-sm font-semibold text-[#374151]">Customer tidak ditemukan</p>
                    <p className="text-xs text-[#6B7280] mt-1">Coba kata kunci atau filter lain</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 text-sm text-[#4F46E5] hover:underline"
                    >
                      Reset semua filter
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customers Card List (Mobile View) */}
      <div className="block md:hidden space-y-4">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div 
              key={customer.id} 
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 hover:border-[#4F46E5]/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-gray-100 shadow-sm">
                    <AvatarImage src={customer.avatarUrl} />
                    <AvatarFallback className="bg-gray-50 text-xs font-bold">
                      {customer.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">{customer.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                      Member since {customer.createdAt ? new Date(customer.createdAt).getFullYear() : "2023"}
                    </p>
                  </div>
                </div>
                <Badge 
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-[10px] font-bold border-none capitalize shadow-sm",
                    customer.status === "active" ? "bg-green-100 text-green-700" : 
                    customer.status === "inactive" ? "bg-yellow-100 text-yellow-700" : 
                    "bg-red-100 text-red-700"
                  )}
                >
                  {customer.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Info</p>
                  <div className="text-xs font-medium text-gray-700 truncate max-w-full flex items-center gap-1.5">
                    <Mail size={12} className="text-gray-400 shrink-0" />
                    <span className="truncate">{customer.email || "—"}</span>
                  </div>
                  <div className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Phone size={12} className="text-gray-400 shrink-0" />
                    <span>{customer.phone || "—"}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transactions</p>
                  <p className="text-xs font-bold text-[#111827]">{customer.visitCount ?? 0} visits</p>
                  <p className="text-xs font-bold text-[#4F46E5] mt-0.5">Rp {formatPrice(customer.totalSpend ?? 0)}</p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setSelectedCustomer(customer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-[#EEF2FF] text-[#6B7280] hover:text-[#4F46E5] text-xs font-bold rounded-lg transition-colors"
                >
                  <ExternalLink size={13} />
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <UserSearch size={44} className="mx-auto text-[#D1D5DB] mb-3" />
            <p className="text-sm font-semibold text-[#374151]">Customer tidak ditemukan</p>
            <p className="text-xs text-[#6B7280] mt-1">Coba kata kunci atau filter lain</p>
            <button
              onClick={handleResetFilters}
              className="mt-4 text-sm text-[#4F46E5] hover:underline font-bold"
            >
              Reset semua filter
            </button>
          </div>
        )}
      </div>

      {/* Drawers */}
      <RegisterCustomerDrawer 
        open={showRegisterDrawer} 
        onOpenChange={setShowRegisterDrawer} 
      />
      
      <CustomerDetailDrawer 
        customer={selectedCustomer} 
        onClose={() => setSelectedCustomer(null)}
        onEdit={(customer) => {
          // Edit functionality could be implemented here or via another drawer
          toast.info("Fitur edit akan segera hadir");
        }}
      />
    </div>
  );
}
