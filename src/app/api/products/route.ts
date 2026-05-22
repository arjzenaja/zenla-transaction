import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const imageFile = formData.get("image") as File | null;
    const isActive = formData.get("isActive") === "true";

    if (!name || isNaN(price)) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    let imageUrl = null;
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `product-${Date.now()}-${imageFile.name.replace(/\s/g, "-")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      const filepath = path.join(uploadDir, filename);
      
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price,
        stock,
        imageUrl,
        userId: session.user.id,
        isActive
      }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function GET(req: Request) {
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

    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
