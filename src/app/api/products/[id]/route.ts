import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

    const { id } = params;
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

    const existingProduct = await prisma.product.findUnique({
      where: { id, userId: session.user.id }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let imageUrl = existingProduct.imageUrl;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = imageFile.type || "image/jpeg";
      const base64Data = buffer.toString("base64");
      imageUrl = `data:${mimeType};base64,${base64Data}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        category,
        price,
        stock,
        imageUrl,
        isActive
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
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

    const { id } = params;
    
    await prisma.product.delete({
      where: { id, userId: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
