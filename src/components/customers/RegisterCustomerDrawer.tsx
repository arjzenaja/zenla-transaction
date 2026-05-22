"use client";

import { useState, useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RegisterCustomerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegisterCustomerDrawer({ open, onOpenChange }: RegisterCustomerDrawerProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerStatus, setCustomerStatus] = useState("active");
  const [isLoyalty, setIsLoyalty] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerStatus("active");
    setIsLoyalty(false);
    setCustomerNotes("");
    setAvatarPreview(null);
  };

  const handleRegisterCustomer = async () => {
    if (!customerName.trim()) {
      toast.error("Nama customer wajib diisi");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:   customerName,
          email:  customerEmail,
          phone:  customerPhone,
          status: customerStatus,
          isLoyalty,
          notes:  customerNotes,
          avatarUrl: avatarPreview, // Using base64 for now as per prompt flow
        }),
      });

      if (!response.ok) throw new Error("Failed to register customer");

      toast.success("Customer berhasil didaftarkan!");
      onOpenChange(false);
      resetForm();
      router.refresh();
    } catch (error) {
      toast.error("Gagal mendaftarkan customer");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) resetForm();
    }}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 bg-white shadow-2xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <h2 className="text-lg font-bold text-[#111827]">Daftarkan Customer Baru</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">Tambahkan customer ke direktori toko Anda</p>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100vh-140px)] space-y-5">

          {/* Avatar upload (opsional) */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="w-16 h-16 rounded-full bg-[#EEF2FF] flex items-center justify-center
                         cursor-pointer hover:bg-[#C7D2FE] transition-colors overflow-hidden border-2
                         border-dashed border-[#C7D2FE]"
            >
              {avatarPreview
                ? <img src={avatarPreview} className="w-full h-full object-cover" />
                : <UserPlus size={22} className="text-[#4F46E5]" />
              }
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
                reader.readAsDataURL(file);
              }}
            />
            <div>
              <p className="text-sm font-medium text-[#111827]">Foto Profil</p>
              <p className="text-xs text-[#6B7280]">Opsional • JPG atau PNG</p>
            </div>
          </div>

          {/* Nama */}
          <div>
            <label className="text-sm font-medium text-[#111827] block mb-1.5">
              Nama Lengkap <span className="text-[#EF4444]">*</span>
            </label>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="e.g. Aditya Pratama"
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-[#111827] block mb-1.5">Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={e => setCustomerEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none"
            />
          </div>

          {/* Telepon */}
          <div>
            <label className="text-sm font-medium text-[#111827] block mb-1.5">Nomor Telepon</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="+62 812-3456-7890"
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-[#111827] block mb-1.5">Status Awal</label>
            <select
              value={customerStatus}
              onChange={e => setCustomerStatus(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-white outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Loyalty Member toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-[#F9FAFB] rounded-xl">
            <div>
              <p className="text-sm font-medium text-[#111827]">Loyalty Member</p>
              <p className="text-xs text-[#6B7280]">
                {isLoyalty ? "Customer mendapat poin reward" : "Customer belum terdaftar loyalty"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLoyalty(!isLoyalty)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isLoyalty ? "bg-[#4F46E5]" : "bg-[#D1D5DB]"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                                transition-transform ${isLoyalty ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Catatan */}
          <div>
            <label className="text-sm font-medium text-[#111827] block mb-1.5">Catatan</label>
            <textarea
              value={customerNotes}
              onChange={e => setCustomerNotes(e.target.value)}
              rows={3}
              placeholder="Catatan tambahan tentang customer ini..."
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm
                         focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent resize-none outline-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E7EB] flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 border border-[#E5E7EB] rounded-xl py-2.5 text-sm
                       font-medium hover:bg-[#F9FAFB] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleRegisterCustomer}
            disabled={isSubmitting}
            className="flex-1 bg-[#4F46E5] text-white rounded-xl py-2.5 text-sm font-medium
                       hover:bg-[#4338CA] transition-colors disabled:opacity-60
                       disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            Daftarkan Customer
          </button>
        </div>

      </SheetContent>
    </Sheet>
  );
}
