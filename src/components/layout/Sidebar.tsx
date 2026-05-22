"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  FileText,
  Package,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  BarChart3,
  Tag,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingCart, label: "POS/Kasir", href: "/pos" },
  { icon: ClipboardList, label: "Riwayat Order", href: "/orders" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: Package, label: "Products", href: "/products" },
  { icon: Tag, label: "Categories", href: "/categories" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-[240px] bg-background border-r border-border px-4 py-6 transition-transform lg:translate-x-0 duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-10 px-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <div>
              <h1 className="font-bold text-[#111827]">Zenla Receipt</h1>
              <p className="text-[10px] text-gray-500 font-medium leading-none">Smart POS System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors",
                  isActive
                    ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold"
                    : "text-[#6B7280] hover:bg-[#F9FAFB]"
                )}
              >
                <item.icon size={20} strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 space-y-1">
          <Link
            href="/help"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
          >
            <HelpCircle size={20} strokeWidth={1.5} />
            <span>Help Center</span>
          </Link>
          <button
            onClick={() => {
              if (onClose) onClose();
              signOut();
            }}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
          >
            <LogOut size={20} strokeWidth={1.5} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

