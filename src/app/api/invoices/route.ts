import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customerName, customerEmail, amount, dueDate, status, notes, items } = body;

    if (!customerName || !amount || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate simple invoice number
    const count = await prisma.invoice.count({
      where: { userId: session.user.id }
    });
    const invoiceNo = `INV-${98421 + count + 1}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        customerName,
        customerEmail,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        status: status || "pending",
        userId: session.user.id,
        notes: notes || null,
        items: items || null,
      },
    });

    // Create invoice notification
    await prisma.notification.create({
      data: {
        type: "invoice_due",
        title: invoice.status === "overdue" ? "Invoice jatuh tempo" : "Invoice baru",
        message: `Invoice #${invoiceNo} status ${invoice.status === "overdue" ? "Jatuh Tempo" : "Pending"}`,
        link: `/invoices`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const invoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { invoiceNo: { contains: search } },
          { customerName: { contains: search } },
          { customerEmail: { contains: search } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
