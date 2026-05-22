import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { BestSellersList } from "@/components/dashboard/BestSellersList";
import { RecentTransactionsTable } from "@/components/dashboard/RecentTransactionsTable";
import { DollarSign, ShoppingBag, Box, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/formatCurrency";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Calculate rolling 30 days ranges for trends
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);

  // 1. Calculate Total Sales and Total Transactions (Overall)
  const txAggregations = await prisma.transaction.aggregate({
    where: {
      userId,
      status: "paid",
    },
    _sum: {
      total: true,
    },
    _count: {
      id: true,
    },
  });

  const totalSales = txAggregations._sum.total || 0;
  const transactions = txAggregations._count.id || 0;

  // 2. Calculate Total Products Sold (Overall)
  const itemAggregation = await prisma.transactionItem.aggregate({
    where: {
      transaction: {
        userId,
        status: "paid",
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const productsSold = itemAggregation._sum.quantity || 0;

  // 3. Net profit (using the logic from stats route, e.g. 80% margin)
  const netProfit = totalSales * 0.8;

  // 4. Calculate Current Period (Last 30 Days) stats
  const currentTxAgg = await prisma.transaction.aggregate({
    where: {
      userId,
      status: "paid",
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    _sum: {
      total: true,
    },
    _count: {
      id: true,
    },
  });

  const currentSales = currentTxAgg._sum.total || 0;
  const currentTransactions = currentTxAgg._count.id || 0;

  const currentProductsAgg = await prisma.transactionItem.aggregate({
    where: {
      transaction: {
        userId,
        status: "paid",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const currentProducts = currentProductsAgg._sum.quantity || 0;

  // 5. Calculate Prior Period (Prior 30 Days) stats
  const priorTxAgg = await prisma.transaction.aggregate({
    where: {
      userId,
      status: "paid",
      createdAt: {
        gte: sixtyDaysAgo,
        lt: thirtyDaysAgo,
      },
    },
    _sum: {
      total: true,
    },
    _count: {
      id: true,
    },
  });

  const priorSales = priorTxAgg._sum.total || 0;
  const priorTransactions = priorTxAgg._count.id || 0;

  const priorProductsAgg = await prisma.transactionItem.aggregate({
    where: {
      transaction: {
        userId,
        status: "paid",
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    },
    _sum: {
      quantity: true,
    },
  });

  const priorProducts = priorProductsAgg._sum.quantity || 0;

  // Helper function to calculate percentage change
  const calculateTrend = (current: number, prior: number) => {
    if (prior === 0) {
      return {
        value: current > 0 ? "100%" : "0%",
        isUp: true,
      };
    }
    const pct = ((current - prior) / prior) * 100;
    return {
      value: `${Math.abs(Math.round(pct))}%`,
      isUp: pct >= 0,
    };
  };

  const salesTrend = calculateTrend(currentSales, priorSales);
  const transactionsTrend = calculateTrend(currentTransactions, priorTransactions);
  const productsSoldTrend = calculateTrend(currentProducts, priorProducts);
  const netProfitTrend = salesTrend;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-0 pt-2">
        <p className="text-xs text-[#6B7280] mb-1">Dashboard</p>
        <h1 className="text-2xl font-bold tracking-tight text-[#111827]">Dashboard Overview</h1>
        <p className="text-sm text-[#6B7280] mt-1">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sales"
          value={`Rp ${formatPrice(totalSales)}`}
          icon={DollarSign}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={salesTrend}
        />
        <StatCard
          title="Transactions"
          value={transactions.toString()}
          icon={ShoppingBag}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          trend={transactionsTrend}
        />
        <StatCard
          title="Products Sold"
          value={productsSold.toString()}
          icon={Box}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          trend={productsSoldTrend}
        />
        <StatCard
          title="Net Profit"
          value={`Rp ${formatPrice(netProfit)}`}
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          trend={netProfitTrend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <BestSellersList />
        </div>
      </div>

      <RecentTransactionsTable />
    </div>
  );
}
