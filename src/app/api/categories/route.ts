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

    const userExists = await (prisma as any).user.findUnique({
      where: { id: session.user.id }
    });
    if (!userExists) {
      return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
    }

    console.log("Prisma keys:", Object.keys(prisma));
    const categories = await (prisma as any).category.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { products: true }
        },
        products: {
          select: { price: true, stock: true }
        }
      },
      orderBy: { name: "asc" }
    });

    const categoriesWithStats = categories.map((category: any) => {
      const productCount = category._count?.products || 0;
      const totalValue = (category.products || []).reduce((sum: number, p: any) => sum + (p.price * p.stock), 0);
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        colorIndex: category.colorIndex,
        productCount,
        totalValue,
        userId: category.userId,
        createdAt: category.createdAt.toISOString()
      };
    });

    return NextResponse.json(categoriesWithStats);
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userExists = await (prisma as any).user.findUnique({
      where: { id: session.user.id }
    });
    if (!userExists) {
      return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, colorIndex } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const category = await (prisma as any).category.create({
      data: {
        name,
        description,
        colorIndex: colorIndex || 0,
        userId: session.user.id
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
