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

    const userId = session.user.id;
    const body = await request.json();
    const { read } = body;

    const updatedNotification = await prisma.notification.update({
      where: {
        id: params.id,
        userId,
      },
      data: {
        read: typeof read === "boolean" ? read : true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("PATCH notification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    await prisma.notification.delete({
      where: {
        id: params.id,
        userId,
      },
    });

    return NextResponse.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("DELETE notification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
