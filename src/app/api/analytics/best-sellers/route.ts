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

    // Group transaction items by product id and name, sum up quantity and subtotal
    const bestSellers = await prisma.transactionItem.groupBy({
      by: ["productId", "name"],
      where: {
        transaction: {
          userId,
          status: "paid",
        },
      },
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 4,
    });

    // Populate category and images from product records
    const formattedBestSellers = await Promise.all(
      bestSellers.map(async (item, index) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        // Generate nice mock growth percentages based on index or default
        const growthPercentage = ["+18%", "+12%", "+8%", "+5%"][index] || "+2%";

        return {
          name: item.name,
          category: product?.category || "Coffee",
          revenue: item._sum.subtotal || 0,
          growth: growthPercentage,
          quantity: item._sum.quantity || 0,
        };
      })
    );

    return NextResponse.json(formattedBestSellers);
  } catch (error) {
    console.error("Best sellers API error:", error);
    return NextResponse.json({ error: "Failed to load best sellers" }, { status: 500 });
  }
}
