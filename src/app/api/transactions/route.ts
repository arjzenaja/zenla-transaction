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

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    if (!userExists) {
      return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { receiptNo: { contains: search } },
          { cashierName: { contains: search } },
          { customerName: { contains: search } },
        ],
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedTransactions = (transactions as any[]).map((tx) => {
      // Format product name summary
      let productSummary = "";
      if (tx.items.length > 0) {
        const firstItem = tx.items[0].name;
        const othersCount = tx.items.length - 1;
        productSummary = othersCount > 0 ? `${firstItem} + ${othersCount} other${othersCount > 1 ? 's' : ''}` : firstItem;
      }

      const displayName = tx.customerName || tx.cashierName || "Guest";

      return {
        id: `#${tx.receiptNo}`,
        dbId: tx.id,
        customer: {
          name: displayName,
          email: "guest@example.com",
          avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(displayName)}`,
        },
        product: productSummary || "No items",
        date: new Date(tx.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        amount: tx.total,
        status: tx.status,
        method: tx.paymentMethod === "credit_card" ? "Credit Card" :
                tx.paymentMethod === "bank_transfer" ? "Bank Transfer" :
                tx.paymentMethod === "qris" ? "QRIS" : "Cash",
        items: tx.items.map((item: any) => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
        })),
      };
    });

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    if (!userExists) {
      return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { items, subtotal, tax, discount, total, paymentMethod, cashierName, customerName } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 });
    }

    // Generate unique receipt number
    const count = await prisma.transaction.count({
      where: { userId },
    });
    const receiptNo = `ZN-${88422 + count}`;

    // Use a Prisma transaction to save both the transaction and update stock
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create Transaction and Transaction Items
      const createdTx = await tx.transaction.create({
        data: {
          receiptNo,
          subtotal: Number(subtotal),
          tax: Number(tax || 0),
          discount: Number(discount || 0),
          total: Number(total),
          paymentMethod: paymentMethod || "cash",
          status: "paid",
          cashierName: cashierName || "Owner",
          customerName: customerName || null,
          userId,
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              name: item.name,
              price: Number(item.price),
              quantity: Number(item.qty || item.quantity),
              subtotal: Number(item.price) * Number(item.qty || item.quantity),
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Create transaction success notification
      await tx.notification.create({
        data: {
          type: "transaction_success",
          title: "Transaksi berhasil",
          message: `Transaksi #${receiptNo} sebesar Rp ${Number(total).toLocaleString()}`,
          link: `/pos/history?id=${createdTx.id}`,
          userId,
        }
      });

      // 2. Decrement stock for each product and check for low stock
      for (const item of items) {
        const qty = Number(item.qty || item.quantity);
        const updatedProduct = await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: qty,
            },
          },
        });

        // Trigger low stock notification if stock is 3 or less
        if (updatedProduct.stock <= 3) {
          const existingNotif = await tx.notification.findFirst({
            where: {
              userId,
              type: "low_stock",
              message: { contains: updatedProduct.name },
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Avoid duplicate alerts in the last 24h
              }
            }
          });

          if (!existingNotif) {
            await tx.notification.create({
              data: {
                type: "low_stock",
                title: "Stok hampir habis",
                message: `${updatedProduct.name} tersisa ${updatedProduct.stock} item`,
                link: `/products?highlight=${updatedProduct.id}`,
                userId,
              }
            });
          }
        }
      }

      return createdTx;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    if (!userExists) {
      return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing ID or status" }, { status: 400 });
    }

    const updatedTx = await prisma.transaction.update({
      where: {
        id: id.startsWith("#") ? undefined : id,
        receiptNo: id.startsWith("#") ? id.slice(1) : undefined,
        userId: session.user.id,
      },
      data: { status },
    });

    return NextResponse.json(updatedTx);
  } catch (error) {
    console.error("PATCH transaction error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}
