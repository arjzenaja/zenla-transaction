"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";

interface InvoiceStatusChangerProps {
  invoiceId: string;
  currentStatus: string;
  onStatusChanged?: () => void;
}

const statusOptions = [
  { value: "pending", label: "Pending", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  { value: "paid", label: "Paid", className: "bg-green-100 text-green-700 hover:bg-green-200" },
  { value: "overdue", label: "Overdue", className: "bg-red-100 text-red-700 hover:bg-red-200" },
];

export function InvoiceStatusChanger({
  invoiceId,
  currentStatus,
  onStatusChanged,
}: InvoiceStatusChangerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;
    setIsLoading(true);
    const toastId = toast.loading(`Mengubah status invoice ke ${newStatus}...`);

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Gagal memperbarui status");
      }

      setStatus(newStatus);
      toast.success(`Status invoice berhasil diubah menjadi ${newStatus.toUpperCase()}`, {
        id: toastId,
      });

      if (onStatusChanged) {
        onStatusChanged();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal mengubah status invoice", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const currentOption = statusOptions.find((opt) => opt.value === status) || {
    value: status,
    label: status,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isLoading}
          className="outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg group"
        >
          <Badge
            className={cn(
              "rounded-lg px-2.5 py-1 text-[10px] font-bold border-none capitalize shadow-sm transition-all duration-200 flex items-center gap-1 cursor-pointer select-none",
              currentOption.className
            )}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                {currentOption.label}
                <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="bg-white rounded-xl border border-gray-100 shadow-xl min-w-[120px] p-1.5 z-50">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={cn(
              "cursor-pointer font-medium text-xs px-2.5 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 flex items-center justify-between",
              status === option.value && "bg-gray-50 text-indigo-600 font-bold"
            )}
          >
            <span>{option.label}</span>
            {status === option.value && (
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
