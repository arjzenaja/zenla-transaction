import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Calculate Total Sales and Total Transactions
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

    // 2. Calculate Total Products Sold
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

    // 3. Net profit (say 80% margin or just total sales)
    const netProfit = totalSales * 0.8;

    return NextResponse.json({
      totalSales,
      transactions,
      productsSold,
      netProfit,
    });
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}
