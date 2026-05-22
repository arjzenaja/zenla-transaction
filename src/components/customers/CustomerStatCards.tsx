import { Card } from "@/components/ui/card";
import { Users, UserCheck, Repeat, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatCurrency";

interface CustomerStatCardsProps {
  customers: any[];
}

export function CustomerStatCards({ customers }: CustomerStatCardsProps) {
  // 1. Calculate stats dynamically
  const totalCustomers = customers.length;
  
  const totalSpend = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const avgLifetimeValue = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
  
  const repeatCount = customers.filter(c => (c.transactionsCount || 0) > 1).length;
  const retentionRate = totalCustomers > 0 ? (repeatCount / totalCustomers) * 100 : 0;
  
  const activeCount = customers.filter(c => c.status === "active").length;

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Avg. Lifetime Value",
      value: `Rp ${formatPrice(avgLifetimeValue)}`,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Retention Rate",
      value: `${retentionRate.toFixed(1)}%`,
      icon: Repeat,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Active Members",
      value: activeCount.toLocaleString(),
      icon: Crown,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="p-5 rounded-2xl border-gray-100 shadow-sm bg-white flex items-center gap-4">
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
            <h3 className="text-xl font-bold text-[#111827]">{stat.value}</h3>
          </div>
        </Card>
      ))}
    </div>
  );
}
