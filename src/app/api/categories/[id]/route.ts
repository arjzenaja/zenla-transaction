import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
    const body = await req.json();
    const { name, description, colorIndex } = body;

    // Ambil nama lama sebelum diupdate
    const oldCategory = await prisma.category.findUnique({
      where: { id, userId: session.user.id }
    });

    // Update kategori
    const updated = await prisma.category.update({
      where: { id, userId: session.user.id },
      data: {
        name,
        description,
        colorIndex
      }
    });

    // ✅ Sync: Update semua produk yang pakai nama kategori lama
    if (oldCategory && oldCategory.name !== name) {
      await prisma.product.updateMany({
        where: { category: oldCategory.name, userId: session.user.id },
        data: { category: name }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Cek kategori ini dipakai berapa produk
    const category = await prisma.category.findUnique({
      where: { id, userId: session.user.id }
    });

    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    const productCount = await prisma.product.count({
      where: { category: category.name, userId: session.user.id }
    });

    // ❌ Tolak jika masih ada produk
    if (productCount > 0) {
      return NextResponse.json(
        { error: `Tidak bisa dihapus — masih ada ${productCount} produk dalam kategori ini` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id, userId: session.user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
