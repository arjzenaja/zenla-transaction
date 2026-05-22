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

    // Check if the user already has any notifications in the persistent database
    const notifCount = await prisma.notification.count({
      where: { userId },
    });

    // Seeding: if the table is completely empty, populate it with existing historical items
    if (notifCount === 0) {
      // 1. Low stock products (stock <= 3)
      const lowStockProducts = await prisma.product.findMany({
        where: {
          userId,
          stock: { lte: 3 },
          isActive: true,
        },
        take: 5,
      });

      const lowStockData = lowStockProducts.map((p) => ({
        type: "low_stock",
        title: "Stok hampir habis",
        message: `${p.name} tersisa ${p.stock} item`,
        link: `/products?highlight=${p.id}`,
        userId,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      }));

      // 2. Recent successful transactions
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          status: "paid",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      const transactionData = recentTransactions.map((tx) => ({
        type: "transaction_success",
        title: "Transaksi berhasil",
        message: `Transaksi #${tx.receiptNo} sebesar Rp ${tx.total.toLocaleString()}`,
        link: `/pos/history?id=${tx.id}`,
        userId,
        createdAt: new Date(tx.createdAt),
      }));

      // 3. Pending/Overdue Invoices
      const pendingInvoices = await prisma.invoice.findMany({
        where: {
          userId,
          status: { in: ["pending", "overdue"] },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      const invoiceData = pendingInvoices.map((inv) => ({
        type: "invoice_due",
        title: inv.status === "overdue" ? "Invoice jatuh tempo" : "Invoice baru",
        message: `Invoice #${inv.invoiceNo} status ${inv.status === "overdue" ? "Jatuh Tempo" : "Pending"}`,
        link: `/invoices`,
        userId,
        createdAt: inv.createdAt ? new Date(inv.createdAt) : new Date(),
      }));

      // Combine and insert into DB if there's any data
      const allSeedData = [...lowStockData, ...transactionData, ...invoiceData];
      if (allSeedData.length > 0) {
        await prisma.notification.createMany({
          data: allSeedData,
        });
      }
    }

    // Fetch all notifications from DB sorted by createdAt desc
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Format response to include `time` (backward compatibility for Header.tsx)
    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      read: notif.read,
      createdAt: notif.createdAt.toISOString(),
      time: notif.createdAt.toISOString(), // Header backward compatibility
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error("GET notifications API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete all notifications for this user
    await prisma.notification.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    console.error("DELETE all notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
