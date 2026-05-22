import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "week";
    const userId = session.user.id;

    // Get all completed transactions for this user
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: "paid",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Helper map of month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let data: { label: string; value: number; revenue: number; orders: number }[] = [];

    if (range === "week") {
      // Group by the last 7 days of the week
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          dateStr: d.toDateString(),
          label: dayNames[d.getDay()],
          value: 0,
          orders: 0,
        };
      });

      transactions.forEach((tx) => {
        const txDateStr = new Date(tx.createdAt).toDateString();
        const found = last7Days.find((day) => day.dateStr === txDateStr);
        if (found) {
          found.value += tx.total;
          found.orders += 1;
        }
      });

      data = last7Days.map((d) => ({ label: d.label, value: d.value, revenue: d.value, orders: d.orders }));

    } else if (range === "month") {
      // Group by weeks of the current month
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      const weeks = [
        { label: "Week 1", value: 0, orders: 0, start: 1, end: 7 },
        { label: "Week 2", value: 0, orders: 0, start: 8, end: 14 },
        { label: "Week 3", value: 0, orders: 0, start: 15, end: 21 },
        { label: "Week 4", value: 0, orders: 0, start: 22, end: 31 },
      ];

      transactions.forEach((tx) => {
        const date = new Date(tx.createdAt);
        if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
          const day = date.getDate();
          const found = weeks.find((w) => day >= w.start && day <= w.end);
          if (found) {
            found.value += tx.total;
            found.orders += 1;
          }
        }
      });

      data = weeks.map((w) => ({ label: w.label, value: w.value, revenue: w.value, orders: w.orders }));

    } else if (range === "30days") {
      // Group by last 30 days
      const last30Days = Array.from({ length: 30 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
          dateStr: d.toDateString(),
          label: `${d.getDate()} ${monthNames[d.getMonth()]}`,
          value: 0,
          orders: 0,
        };
      });

      transactions.forEach((tx) => {
        const txDateStr = new Date(tx.createdAt).toDateString();
        const found = last30Days.find((day) => day.dateStr === txDateStr);
        if (found) {
          found.value += tx.total;
          found.orders += 1;
        }
      });

      data = last30Days.map((d) => ({ label: d.label, value: d.value, revenue: d.value, orders: d.orders }));

    } else if (range === "3months") {
      // Last 3 months
      const now = new Date();
      const months = Array.from({ length: 3 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
        return {
          year: d.getFullYear(),
          month: d.getMonth(),
          label: monthNames[d.getMonth()],
          value: 0,
          orders: 0,
        };
      });

      transactions.forEach((tx) => {
        const date = new Date(tx.createdAt);
        const txYear = date.getFullYear();
        const txMonth = date.getMonth();

        const found = months.find((m) => m.year === txYear && m.month === txMonth);
        if (found) {
          found.value += tx.total;
          found.orders += 1;
        }
      });

      data = months.map((m) => ({ label: m.label, value: m.value, revenue: m.value, orders: m.orders }));

    } else if (range === "year") {
      // Current year months
      const currentYear = new Date().getFullYear();
      const yearMonths = monthNames.map((name, index) => ({
        monthIndex: index,
        label: name,
        value: 0,
        orders: 0,
      }));

      transactions.forEach((tx) => {
        const date = new Date(tx.createdAt);
        if (date.getFullYear() === currentYear) {
          const found = yearMonths.find((m) => m.monthIndex === date.getMonth());
          if (found) {
            found.value += tx.total;
            found.orders += 1;
          }
        }
      });

      data = yearMonths.map((m) => ({ label: m.label, value: m.value, revenue: m.value, orders: m.orders }));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Fetch analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
