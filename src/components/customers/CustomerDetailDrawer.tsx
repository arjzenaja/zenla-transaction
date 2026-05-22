"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Mail, Phone, Pencil, Trash2, ExternalLink } from "lucide-react";
import { formatCurrency as formatIDR } from "@/lib/formatCurrency";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CustomerDetailDrawerProps {
  customer: any | null;
  onClose: () => void;
  onEdit: (customer: any) => void;
}

const StatusBadge = ({ status, small = false }: { status: string | undefined, small?: boolean }) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-yellow-100 text-yellow-700",
    churned: "bg-red-100 text-red-700",
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${colors[status || "active"] || "bg-gray-100 text-gray-700"} ${small ? "px-2 py-0" : ""}`}>
      {status}
    </span>
  );
};

export function CustomerDetailDrawer({ customer, onClose, onEdit }: CustomerDetailDrawerProps) {
  const router = useRouter();

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus customer ini?")) return;
    
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete customer");

      toast.success("Customer berhasil dihapus");
      onClose();
      router.refresh();
    } catch (error) {
      toast.error("Gagal menghapus customer");
    }
  };

  return (
    <Sheet open={!!customer} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 bg-white shadow-2xl">

        {/* Header dengan avatar */}
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            {customer?.avatarUrl
              ? <img src={customer.avatarUrl}
                  className="w-14 h-14 rounded-full object-cover border border-gray-100" />
              : <div className="w-14 h-14 rounded-full bg-[#EEF2FF] flex items-center
                                justify-center text-xl font-bold text-[#4F46E5]">
                  {customer?.name?.charAt(0).toUpperCase()}
                </div>
            }
            <div>
              <h2 className="text-lg font-bold text-[#111827]">{customer?.name}</h2>
              <p className="text-sm text-[#6B7280]">
                Member sejak {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString("id-ID", { year: 'numeric', month: 'long' }) : "—"}
              </p>
              <div className="mt-1">
                <StatusBadge status={customer?.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100vh-200px)] space-y-5">

          {/* Stat cards ringkasan */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Transaksi",    value: customer?.visitCount ?? 0 },
              { label: "Total Belanja", value: formatIDR(customer?.totalSpend ?? 0) },
              { label: "Loyalty",      value: customer?.isLoyalty ? "Member" : "Non-member" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F9FAFB] rounded-xl p-3 text-center border border-gray-50">
                <p className="text-xs text-[#6B7280] mb-1">{label}</p>
                <p className="text-sm font-bold text-[#111827]">{value}</p>
              </div>
            ))}
          </div>

          {/* Informasi kontak */}
          <div>
            <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
              Informasi Kontak
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={15} className="text-[#9CA3AF] flex-shrink-0" />
                <span className="text-[#374151]">{customer?.email ?? "—"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={15} className="text-[#9CA3AF] flex-shrink-0" />
                <span className="text-[#374151]">{customer?.phone ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Riwayat transaksi terakhir */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                Transaksi Terakhir
              </p>
              <button className="text-xs text-[#4F46E5] hover:underline">Lihat Semua</button>
            </div>
            <div className="space-y-2">
              {/* Note: This assumes transaction relation is fetched or passed. 
                  For now, we'll show a placeholder as per prompt UI. */}
              {customer?.recentTransactions?.length > 0 ? (
                customer.recentTransactions.slice(0, 4).map((trx: any) => (
                  <div key={trx.id}
                    className="flex items-center justify-between py-2.5 px-3
                               bg-[#F9FAFB] rounded-xl text-sm border border-gray-50">
                    <div>
                      <p className="font-medium text-[#111827]">#{trx.id}</p>
                      <p className="text-xs text-[#6B7280]">{trx.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#111827]">{formatIDR(trx.amount)}</p>
                      <StatusBadge status={trx.status} small />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#9CA3AF] text-center py-4 bg-[#F9FAFB] rounded-xl border border-dashed border-gray-200">
                  Belum ada transaksi
                </p>
              )}
            </div>
          </div>

          {/* Catatan */}
          {customer?.notes && (
            <div>
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                Catatan
              </p>
              <p className="text-sm text-[#374151] bg-[#F9FAFB] rounded-xl p-3 border border-gray-50">
                {customer.notes}
              </p>
            </div>
          )}

        </div>

        {/* Footer action buttons */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3">
          <button
            onClick={() => { onEdit(customer); onClose(); }}
            className="flex-1 border border-[#E5E7EB] rounded-xl py-2.5 text-sm font-medium
                       hover:bg-[#F9FAFB] transition-colors flex items-center justify-center gap-2"
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            onClick={() => handleDeleteCustomer(customer.id)}
            className="flex-1 border border-[#EF4444] text-[#EF4444] rounded-xl py-2.5 text-sm
                       font-medium hover:bg-[#FEF2F2] transition-colors flex items-center
                       justify-center gap-2"
          >
            <Trash2 size={15} /> Hapus
          </button>
        </div>

      </SheetContent>
    </Sheet>
  );
}
