import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ReceiptClient from "./ReceiptClient";

interface Props {
  params: { id: string };
}

export default async function ReceiptPage({ params }: Props) {
  // Fetch transaction from DB based on receiptNo or id
  // Note: we clean the id in case it contains # prefix (e.g. ZN-88422 vs #ZN-88422)
  const queryId = params.id.startsWith("%23") 
    ? decodeURIComponent(params.id).replace("#", "") 
    : params.id.replace("#", "");

  const transaction = await prisma.transaction.findFirst({
    where: {
      OR: [
        { id:        queryId },
        { receiptNo: queryId },
      ]
    },
    include: {
      items: true,
      user:  {
        select: {
          shopName:  true,
          address:   true,
          phone:     true,
          logoUrl:   true,
        }
      }
    }
  });

  if (!transaction) {
    notFound();
  }

  // Serialize date and big decimal values to prevent hydration/serialization issues
  const serializedTransaction = {
    ...transaction,
    createdAt: transaction.createdAt.toISOString(),
    items: transaction.items.map(item => ({
      ...item,
    })),
  };

  return <ReceiptClient transaction={serializedTransaction} />;
}
