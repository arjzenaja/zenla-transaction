import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    // Determine if id is dynamic receipt number or database id
    const transaction = await prisma.transaction.update({
      where: {
        id: id.startsWith("ZN-") ? undefined : id,
        receiptNo: id.startsWith("ZN-") ? id : undefined,
        userId: session.user.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("PATCH transaction dynamic route error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}
