import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete all data scoped to this user only (safe — won't affect other users)
    const deletedItems = await prisma.transactionItem.deleteMany({
      where: { transaction: { userId } }
    });

    const deletedTransactions = await prisma.transaction.deleteMany({
      where: { userId }
    });

    const deletedInvoices = await prisma.invoice.deleteMany({
      where: { userId }
    });

    const deletedCustomers = await prisma.customer.deleteMany({
      where: { userId }
    });

    const deletedProducts = await prisma.product.deleteMany({
      where: { userId }
    });

    return NextResponse.json({
      message: "Database cleared successfully",
      deleted: {
        transactionItems: deletedItems.count,
        transactions: deletedTransactions.count,
        invoices: deletedInvoices.count,
        customers: deletedCustomers.count,
        products: deletedProducts.count,
      }
    });
  } catch (error) {
    console.error("Clear data error:", error);
    return NextResponse.json({ error: "Failed to clear data" }, { status: 500 });
  }
}
