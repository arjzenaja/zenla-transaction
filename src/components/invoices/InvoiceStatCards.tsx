import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatCurrency";

interface InvoiceStatCardsProps {
  invoices: any[];
}

export function InvoiceStatCards({ invoices }: InvoiceStatCardsProps) {
  // 1. Calculate stats dynamically
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoicesCount = invoices.filter(inv => inv.status === "paid").length;
  
  const pendingPayments = invoices
    .filter(inv => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0);
    
  const overduePayments = invoices
    .filter(inv => inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const collectionRate = totalRevenue > 0 
    ? (invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0) / totalRevenue) * 100 
    : 0;

  const stats = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Paid Invoices",
      value: paidInvoicesCount,
      color: "text-green-600",
      bg: "bg-green-50",
      isCount: true,
    },
    {
      title: "Pending Payments",
      value: pendingPayments,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Overdue Invoices",
      value: overduePayments,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="p-5 rounded-2xl border-gray-100 shadow-sm bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{stat.title}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold text-[#111827]">
              {stat.isCount ? stat.value : `Rp ${formatPrice(stat.value)}`}
            </h3>
            <div className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase", stat.bg, stat.color)}>
              {stat.isCount ? "invoices" : "total"}
            </div>
          </div>
        </Card>
      ))}
      <Card className="p-5 rounded-2xl border-none bg-[#4F46E5] lg:col-span-1 text-white shadow-lg shadow-indigo-100 flex flex-col justify-between overflow-hidden relative">
        <div className="z-10">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Collection Rate</p>
          <h3 className="text-3xl font-bold">{collectionRate.toFixed(1)}%</h3>
        </div>
        <p className="text-[10px] text-white/60 font-medium z-10">
          {collectionRate > 80 ? "Your payment collection is healthy" : "Requires follow-up with customers"}
        </p>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      </Card>
    </div>
  );
}
