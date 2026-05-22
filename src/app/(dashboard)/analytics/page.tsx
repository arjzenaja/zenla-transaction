"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatCurrency";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, ShoppingBag, CreditCard, PackageOpen, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ranges = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "30days", label: "Last 30 Days" },
  { id: "3months", label: "Last 3 Months" },
  { id: "year", label: "This Year" },
];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("week");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [stats, setStats] = useState({
    totalSales: 0,
    transactions: 0,
    productsSold: 0,
    netProfit: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch general dashboard stats
        const statsRes = await fetch("/api/analytics/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // 2. Fetch best selling products
        const sellersRes = await fetch("/api/analytics/best-sellers");
        if (sellersRes.ok) {
          const sellersData = await sellersRes.json();
          setTopProducts(sellersData);
        }

        // 3. Fetch hourly traffic (grouped from all transactions)
        const txsRes = await fetch("/api/transactions");
        if (txsRes.ok) {
          const txs = await txsRes.json();
          const groupedHourly = groupHourlyTraffic(txs);
          setHourlyData(groupedHourly);
        }
      } catch (error) {
        console.error("Failed to load analytics page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Fetch range-specific chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`/api/analytics?range=${selectedRange}`);
        if (response.ok) {
          const data = await response.json();
          setRevenueData(data);
        }
      } catch (error) {
        console.error("Failed to fetch range chart data:", error);
      }
    };
    fetchChartData();
  }, [selectedRange]);

  const groupHourlyTraffic = (transactions: any[]) => {
    const buckets = [
      { hour: "08:00", sales: 0 },
      { hour: "10:00", sales: 0 },
      { hour: "12:00", sales: 0 },
      { hour: "14:00", sales: 0 },
      { hour: "16:00", sales: 0 },
      { hour: "18:00", sales: 0 },
      { hour: "20:00", sales: 0 },
      { hour: "22:00", sales: 0 },
    ];

    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt || tx.date);
      const hour = date.getHours();
      
      let closestIndex = 0;
      let minDiff = Infinity;
      buckets.forEach((b, index) => {
        const bHour = parseInt(b.hour.split(":")[0]);
        const diff = Math.abs(hour - bHour);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = index;
        }
      });
      
      buckets[closestIndex].sales += 1;
    });

    return buckets;
  };

  const activeRangeLabel = ranges.find(r => r.id === selectedRange)?.label || "This Week";
  const avgOrderValue = stats.transactions > 0 ? stats.totalSales / stats.transactions : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Analytics Overview</h1>
          <p className="text-sm text-gray-500 font-medium">Insights and performance of your business</p>
        </div>
        
        <div className="relative">
          <Button 
            variant="outline" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="rounded-xl border-gray-200 text-sm font-semibold gap-2 min-w-[140px] justify-between bg-white"
          >
            {activeRangeLabel}
            <ChevronDown size={16} className={cn("transition-transform duration-200", isDropdownOpen && "rotate-180")} />
          </Button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-md border border-[#E5E7EB] w-[180px] z-50 py-1 overflow-hidden">
              {ranges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => {
                    setSelectedRange(range.id);
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors",
                    selectedRange === range.id ? "text-[#4F46E5] font-semibold bg-indigo-50/50" : "text-gray-600 hover:bg-[#F9FAFB]"
                  )}
                >
                  {range.label}
                  {selectedRange === range.id && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl border-gray-100 shadow-sm bg-white flex items-center gap-5">
          <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-[#111827]">Rp {formatPrice(stats.totalSales)}</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Accumulated overall sales</p>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-gray-100 shadow-sm bg-white flex items-center gap-5">
          <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-[#111827]">{stats.transactions}</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Total successful transactions</p>
          </div>
        </Card>
        <Card className="p-6 rounded-2xl border-gray-100 shadow-sm bg-white flex items-center gap-5">
          <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <CreditCard size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Average Order</p>
            <h3 className="text-2xl font-bold text-[#111827]">Rp {formatPrice(avgOrderValue)}</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Average spent per ticket</p>
          </div>
        </Card>
      </div>

      {/* Revenue Over Time Line Chart */}
      <Card className="p-4 sm:p-8 rounded-2xl border-gray-100 shadow-sm bg-white">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-lg font-bold text-[#111827]">Revenue Over Time</h3>
            <p className="text-sm text-gray-500 font-medium">Revenue and order distribution based on {activeRangeLabel.toLowerCase()}</p>
          </div>
        </div>
        <div className="h-[400px] w-full relative">
          {revenueData.length === 0 || revenueData.every(item => item.revenue === 0) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Belum ada data visualisasi</p>
                <p className="text-xs text-gray-500 font-medium">Grafik performa pendapatan akan muncul saat transaksi terekam.</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [name === "Revenue" ? `Rp ${formatPrice(value)}` : value, name]}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#4F46E5" strokeWidth={4} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10B981" strokeWidth={4} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <Card className="p-4 sm:p-8 rounded-2xl border-gray-100 shadow-sm bg-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-[#111827]">Top Products</h3>
          </div>
          <div className="space-y-6">
            {topProducts.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <PackageOpen size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Belum ada penjualan produk</p>
                  <p className="text-xs text-gray-500 font-medium">Bestseller list akan otomatis terisi saat checkout.</p>
                </div>
              </div>
            ) : (
              topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#111827]">{product.name}</h4>
                      <p className="text-xs text-gray-500 font-medium">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#111827]">Rp {formatPrice(product.revenue)}</p>
                    <p className="text-[10px] text-indigo-600 font-bold">{product.quantity} sold</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Hourly Traffic */}
        <Card className="p-4 sm:p-8 rounded-2xl border-gray-100 shadow-sm bg-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-[#111827]">Hourly Traffic</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Peak times</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Bar dataKey="sales" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
