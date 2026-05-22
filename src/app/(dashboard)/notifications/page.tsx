"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  PackageX,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  X,
  Trash2,
  CheckCheck,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "low_stock" | "transaction_success" | "invoice_due" | "new_customer" | "system";
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        toast.error("Gagal mengambil data notifikasi");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { key: "all", label: "Semua" },
    { key: "unread", label: "Belum Dibaca" },
    { key: "low_stock", label: "Stok" },
    { key: "transaction", label: "Transaksi" },
    { key: "invoice", label: "Invoice" },
    { key: "system", label: "Lainnya" },
  ];

  const getFilteredNotifications = () => {
    return notifications.filter((n) => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return !n.read;
      if (activeTab === "transaction") return n.type === "transaction_success";
      if (activeTab === "invoice") return n.type === "invoice_due";
      return n.type === activeTab;
    });
  };

  const filteredNotifications = getFilteredNotifications();

  // Helper to format relative time in Indonesian
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Safety check for future dates/skewed clock
    if (diffMs < 0) return "Baru saja";

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Group notifications by date label
  const getGroupedNotifications = (items: Notification[]) => {
    return items.reduce((groups, notif) => {
      const date = new Date(notif.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let label: string;
      if (date.toDateString() === today.toDateString()) {
        label = "Hari Ini";
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = "Kemarin";
      } else {
        label = date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(notif);
      return groups;
    }, {} as Record<string, Notification[]>);
  };

  const groupedNotifications = getGroupedNotifications(filteredNotifications);

  const getNotifConfig = (type: string) => {
    const configs: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      low_stock: {
        icon: <PackageX size={18} />,
        color: "bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] dark:bg-orange-950/20 dark:text-orange-400",
        label: "Stok Menipis",
      },
      transaction_success: {
        icon: <CheckCircle size={18} />,
        color: "bg-[#DCFCE7] text-[#16A34A] border border-[#HN-D1] dark:bg-emerald-950/20 dark:text-emerald-400",
        label: "Transaksi",
      },
      invoice_due: {
        icon: <AlertTriangle size={18} />,
        color: "bg-[#FEF3C7] text-[#D97706] border border-[#FEF3C7] dark:bg-amber-950/20 dark:text-amber-400",
        label: "Invoice",
      },
      new_customer: {
        icon: <UserPlus size={18} />,
        color: "bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FF] dark:bg-indigo-950/20 dark:text-indigo-400",
        label: "Customer Baru",
      },
      system: {
        icon: <Bell size={18} />,
        color: "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB] dark:bg-slate-800 dark:text-slate-400",
        label: "Sistem",
      },
    };

    return configs[type] || {
      icon: <Bell size={18} />,
      color: "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]",
      label: "Notifikasi",
    };
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.read) {
      try {
        await fetch(`/api/notifications/${notif.id}`, {
          method: "PATCH",
          body: JSON.stringify({ read: true }),
          headers: { "Content-Type": "application/json" },
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.filter(n => !n.read).length === 0) return;
    
    const toastId = toast.loading("Menandai semua sebagai dibaca...");
    try {
      const res = await fetch("/api/notifications/mark-all-read", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("Semua notifikasi ditandai dibaca", { id: toastId });
      } else {
        toast.error("Gagal memperbarui status", { id: toastId });
      }
    } catch (err) {
      toast.error("Gagal melakukan aksi", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notifikasi dihapus");
      } else {
        toast.error("Gagal menghapus notifikasi");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    if (!confirm("Apakah Anda yakin ingin menghapus semua notifikasi? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }

    const toastId = toast.loading("Menghapus semua notifikasi...");
    try {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      if (res.ok) {
        setNotifications([]);
        toast.success("Semua notifikasi berhasil dihapus", { id: toastId });
      } else {
        toast.error("Gagal menghapus notifikasi", { id: toastId });
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghapus", { id: toastId });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Notifikasi</h1>
          <p className="text-sm text-slate-400 mt-1">Semua notifikasi aktivitas toko Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.filter((n) => !n.read).length === 0}
            className="flex items-center gap-2 border border-slate-200 bg-white
                       rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800
                       hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all shadow-sm"
          >
            <CheckCheck size={14} className="text-slate-400" />
            Tandai Semua Dibaca
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-2 border border-rose-100 bg-rose-50/50
                       rounded-2xl px-4 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700
                       hover:bg-rose-50 hover:border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all shadow-sm"
          >
            <Trash2 size={14} />
            Hapus Semua
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex gap-2 pb-px min-w-max">
          {tabs.map((tab) => {
            const count =
              tab.key === "all"
                ? notifications.length
                : tab.key === "unread"
                ? notifications.filter((n) => !n.read).length
                : tab.key === "transaction"
                ? notifications.filter((n) => n.type === "transaction_success").length
                : tab.key === "invoice"
                ? notifications.filter((n) => n.type === "invoice_due").length
                : notifications.filter((n) => n.type === tab.key).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap
                  ${
                    activeTab === tab.key
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors
                      ${
                        activeTab === tab.key
                          ? "bg-indigo-600 text-white"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-400 mt-4">Memuat notifikasi...</p>
        </div>
      ) : (
        <>
          {/* Notification Lists Grouped by Date */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([dateLabel, items]) => (
                <div key={dateLabel} className="space-y-3">
                  {/* Date section label */}
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    {dateLabel}
                  </h3>

                  {/* List of items */}
                  <div className="space-y-3">
                    {items.map((notif) => {
                      const config = getNotifConfig(notif.type);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer
                                      transition-all hover:shadow-md group relative
                            ${
                              notif.read
                                ? "bg-white border-slate-100 hover:border-indigo-100"
                                : "bg-indigo-50/40 border-indigo-100 hover:border-indigo-200 shadow-sm shadow-indigo-50/50"
                            }`}
                        >
                          {/* Icon Block */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${config.color}`}
                          >
                            {config.icon}
                          </div>

                          {/* Content Block */}
                          <div className="flex-1 min-w-0 pr-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <p
                                className={`text-sm font-bold text-slate-800 leading-snug truncate`}
                              >
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {formatRelativeTime(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-1.5 mt-2.5">
                              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                {config.label}
                              </span>
                              {!notif.read && (
                                <>
                                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                  <span className="text-[10px] font-bold text-indigo-600 tracking-wide">
                                    Baru
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notif.id);
                            }}
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5
                                       bg-rose-50 text-rose-500 hover:bg-rose-100
                                       rounded-lg transition-all"
                            title="Hapus Notifikasi"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                <BellOff size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-700">
                {activeTab === "unread" ? "Tidak ada notifikasi baru" : "Belum ada notifikasi"}
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                {activeTab === "unread"
                  ? "Hebat! Semua notifikasi Anda sudah selesai dibaca."
                  : "Notifikasi aktivitas penjualan atau stok toko Anda akan muncul di sini."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
