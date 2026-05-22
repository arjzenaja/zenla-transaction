import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const where: any = { userId: session.user.id };
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: "asc" }, // Sorting alphabetically makes autocomplete selection easier
      take: limit,
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Fetch customers error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const customer = await prisma.customer.create({
      data: {
        name:      body.name,
        email:     body.email,
        phone:     body.phone,
        status:    body.status ?? "active",
        isLoyalty: body.isLoyalty ?? false,
        notes:     body.notes,
        userId:    session.user.id,
      }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
