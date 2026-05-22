"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const ranges = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "30days", label: "Last 30 Days" },
  { id: "3months", label: "Last 3 Month" },
  { id: "year", label: "This Year" },
];

export function RevenueChart() {
  const [selectedRange, setSelectedRange] = useState("week");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analytics?range=${selectedRange}`);
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedRange]);

  const activeRangeLabel = ranges.find(r => r.id === selectedRange)?.label || "This Week";

  return (
    <Card className="p-6 rounded-2xl border-gray-100 shadow-sm bg-card h-full relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-bold text-[#111827]">Revenue Performance</h3>
          <p className="text-sm text-gray-500 font-medium">Sales insights based on {activeRangeLabel.toLowerCase()}</p>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="outline" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="rounded-xl border-gray-200 text-sm font-semibold gap-2 min-w-[140px] justify-between"
          >
            {activeRangeLabel}
            <ChevronDown size={16} className={cn("transition-transform duration-200", isDropdownOpen && "rotate-180")} />
          </Button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-md border border-[#E5E7EB] w-[180px] z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
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

      <div className={cn("h-[300px] w-full relative transition-opacity duration-300", isLoading && "opacity-50")}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/60">
            <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
          </div>
        )}
        
        {!isLoading && (chartData.length === 0 || chartData.every(item => item.value === 0)) ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Belum ada aktivitas penjualan</p>
              <p className="text-xs text-gray-500 font-medium">Grup data berdasarkan {activeRangeLabel.toLowerCase()} masih kosong.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                cursor={{ fill: '#F9FAFB' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`Rp ${new Intl.NumberFormat('id-ID').format(value)}`, 'Revenue']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={selectedRange === '30days' ? 8 : 32}>
                {chartData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === chartData.length - 1 ? '#4F46E5' : '#E5E7EB'} 
                    className="hover:fill-[#4F46E5] transition-colors cursor-pointer" 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
