"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  Menu, 
  PackageX, 
  CheckCircle, 
  AlertTriangle, 
  UserPlus, 
  ChevronRight, 
  User, 
  Store, 
  BarChart3, 
  HelpCircle, 
  FileText, 
  LogOut, 
  Moon, 
  Sun,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pos": "POS / Kasir",
  "/invoices": "Invoices",
  "/products": "Products",
  "/customers": "Customers",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Dropdown States
  const [activeDropdown, setActiveDropdown] = useState<"search" | "notifications" | "account" | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Refs for click outside
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node) &&
          notificationsRef.current && !notificationsRef.current.contains(event.target as Node) &&
          accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theme Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem("zenla-theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("zenla-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("zenla-theme", "light");
    }
  };

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Search Logic with Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        const [products, transactions, invoices, customers] = await Promise.all([
          fetch(`/api/products?search=${searchQuery}`).then(res => res.ok ? res.json() : []),
          fetch(`/api/transactions?search=${searchQuery}`).then(res => res.ok ? res.json() : []),
          fetch(`/api/invoices?search=${searchQuery}`).then(res => res.ok ? res.json() : []),
          fetch(`/api/customers?search=${searchQuery}`).then(res => res.ok ? res.json() : []),
        ]);
        
        setSearchResults({ products, transactions, invoices, customers });
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const markAllAsRead = async () => {
    // Optimistic local update
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "PATCH"
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const currentPath = Object.keys(pageTitles).find(path => pathname.startsWith(path)) || "";
  const title = pageTitles[currentPath] || "Overview";

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[240px] z-30 h-16 bg-background border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-gray-500"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </Button>
        <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block w-64" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search anything..." 
            className="pl-10 h-10 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveDropdown("search");
            } }
            onFocus={() => setActiveDropdown("search")}
            onKeyDown={(e) => {
              if (e.key === "Escape") setActiveDropdown(null);
              if (e.key === "Enter" && searchQuery) {
                router.push(`/search?q=${searchQuery}`);
                setActiveDropdown(null);
              }
            } }
          />

          {activeDropdown === "search" && searchQuery && (
            <div className="absolute top-full left-0 mt-2 w-[450px] bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50">
              <div className="max-height-[480px] overflow-y-auto p-2">
                {isSearchLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-100 rounded w-1/2" />
                          <div className="h-2 bg-gray-50 rounded w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Products Section */}
                    {searchResults?.products?.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Products</div>
                        {searchResults.products.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              router.push(`/products?highlight=${item.id}`);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F9FAFB] rounded-xl transition-colors text-left"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <PackageX size={18} className="text-gray-400" />}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">Rp {item.price?.toLocaleString()}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Customers Section */}
                    {searchResults?.customers?.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Customers</div>
                        {searchResults.customers.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              router.push(`/customers?highlight=${item.id}`);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#F9FAFB] rounded-xl transition-colors text-left"
                          >
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {item.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.email}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Transactions Section */}
                    {searchResults?.transactions?.length > 0 && (
                      <div className="mb-4">
                        <div className="px-3 py-2 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Transactions</div>
                        {searchResults.transactions.map((item: any) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              router.push(`/pos/history?id=${item.id}`);
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#F9FAFB] rounded-xl transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                <FileText size={18} className="text-gray-400" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">#{item.orderNumber || item.id.substring(0, 8)}</div>
                                <div className="text-xs text-gray-500">Rp {item.total?.toLocaleString()}</div>
                              </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                              {item.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {(!searchResults || Object.values(searchResults).every((arr: any) => arr?.length === 0)) && (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Search size={20} className="text-gray-400" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">No results found</div>
                        <div className="text-xs text-gray-500 mt-1">We couldn't find anything matching "{searchQuery}"</div>
                      </div>
                    )}

                    <div className="p-2 border-t border-gray-100">
                      <button 
                        onClick={() => {
                          router.push(`/search?q=${searchQuery}`);
                          setActiveDropdown(null);
                        }}
                        className="w-full py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        View all results for "{searchQuery}" <ChevronRight size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={notificationsRef}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative text-gray-500"
              onClick={() => {
                setActiveDropdown(activeDropdown === "notifications" ? null : "notifications");
                if (unreadCount > 0) markAllAsRead();
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 flex items-center justify-center bg-[#EF4444] text-white text-[10px] font-bold rounded-full w-4 h-4 border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </Button>

            {activeDropdown === "notifications" && (
              <div className="absolute top-full right-0 mt-2 w-[380px] bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Mark all ✓
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={async () => {
                          // Mark as read in DB if unread
                          if (!notif.read) {
                            try {
                              await fetch(`/api/notifications/${notif.id}`, {
                                method: "PATCH",
                                body: JSON.stringify({ read: true }),
                                headers: { "Content-Type": "application/json" }
                              });
                              // Refresh notifications lists/counts
                              fetchNotifications();
                            } catch (err) {
                              console.error("Failed to mark notification as read:", err);
                            }
                          }

                          // Handle navigation based on type
                          if (notif.type === "low_stock") router.push("/products");
                          if (notif.type === "transaction_success") router.push("/pos/history");
                          if (notif.type === "invoice_due") router.push("/invoices");
                          if (notif.type === "new_customer") router.push("/customers");
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex gap-3 p-4 text-left transition-colors border-b border-gray-50 last:border-0 ${notif.read ? 'bg-white' : 'bg-[#EEF2FF]'}`}
                      >
                        <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          notif.type === 'low_stock' ? 'bg-orange-50 text-orange-600' :
                          notif.type === 'transaction_success' ? 'bg-green-50 text-green-600' :
                          notif.type === 'invoice_due' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-indigo-50 text-indigo-600'
                        }`}>
                          {notif.type === 'low_stock' && <PackageX size={16} />}
                          {notif.type === 'transaction_success' && <CheckCircle size={16} />}
                          {notif.type === 'invoice_due' && <AlertTriangle size={16} />}
                          {notif.type === 'new_customer' && <UserPlus size={16} />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">{notif.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{notif.message}</div>
                          <div className="text-[10px] text-gray-400 mt-2">
                            {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(notif.time).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">No new notifications</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    router.push("/notifications");
                  }}
                  className="w-full text-center py-3 text-sm text-[#4F46E5] font-medium
                             hover:bg-[#F9FAFB] border-t border-[#E5E7EB]"
                >
                  Lihat semua notifikasi →
                </button>
              </div>
            )}
          </div>
          
          <div className="relative" ref={accountRef}>
            <button 
              className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-xl transition-colors text-left"
              onClick={() => setActiveDropdown(activeDropdown === "account" ? null : "account")}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[#111827]">{session?.user?.name || "Zenla Shop"}</p>
                <p className="text-[11px] text-gray-500">Owner</p>
              </div>
              <Avatar className="h-9 w-9 border border-gray-200">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-[#4F46E5] text-white text-sm font-bold">
                  {(session?.user?.name || "ZS").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>

            {activeDropdown === "account" && (
              <div className="absolute top-full right-0 mt-2 w-[260px] bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden z-50 py-2">
                <div className="px-4 py-3 border-b border-gray-50 mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4F46E5] text-white rounded-full flex items-center justify-center font-bold">
                      {(session?.user?.name || "ZS").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-semibold text-gray-900 truncate">{session?.user?.name || "Zenla Shop"}</div>
                      <div className="text-[11px] text-gray-500 truncate">{session?.user?.email || "demo@zenla.com"}</div>
                    </div>
                  </div>
                </div>

                <div className="px-2 space-y-1">
                  <button onClick={() => { router.push("/settings?tab=profile"); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                    <User size={16} className="text-gray-400" /> Profile & Settings
                  </button>
                  <button onClick={() => { router.push("/settings?tab=shop"); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                    <Store size={16} className="text-gray-400" /> Shop Settings
                  </button>
                  <button onClick={() => { router.push("/analytics"); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                    <BarChart3 size={16} className="text-gray-400" /> Analytics
                  </button>
                </div>

                <div className="my-2 border-t border-gray-50 px-2 pt-2">
                  <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Moon size={16} className="text-gray-400" /> : <Sun size={16} className="text-gray-400" />}
                      Dark Mode
                    </div>
                    <button 
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="px-2 space-y-1 border-t border-gray-50 mt-2 pt-2">
                  <button onClick={() => { router.push("/help"); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                    <HelpCircle size={16} className="text-gray-400" /> Help Center
                  </button>
                  <button onClick={() => { window.open("/docs", "_blank"); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-[#F9FAFB] rounded-xl transition-colors">
                    <FileText size={16} className="text-gray-400" /> Documentation
                  </button>
                </div>

                <div className="px-2 mt-2 pt-2 border-t border-gray-50">
                  <button 
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors font-medium"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
