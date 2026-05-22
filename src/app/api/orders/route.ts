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
      where: { id: session.user.id },
    });
    if (!userExists) {
      return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const method = searchParams.get("method");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Build Prisma query filters
    const whereClause: any = {
      userId: session.user.id,
    };

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (method && method !== "all") {
      whereClause.paymentMethod = method;
    }

    if (from || to) {
      whereClause.createdAt = {};
      if (from) {
        whereClause.createdAt.gte = new Date(from);
      }
      if (to) {
        // Match up to the end of the specified 'to' day
        whereClause.createdAt.lte = new Date(to + "T23:59:59");
      }
    }

    const orders = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
