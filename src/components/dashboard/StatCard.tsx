import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend: {
    value: string;
    isUp: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <Card className="p-5 rounded-2xl shadow-sm bg-card hover:shadow-md transition-shadow border-none">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", iconBg)}>
          <Icon size={24} className={iconColor} strokeWidth={2} />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
          trend.isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {trend.isUp ? "↑" : "↓"} {trend.value}
        </div>
      </div>
      
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-[#111827]">{value}</h3>
      </div>
    </Card>
  );
}
