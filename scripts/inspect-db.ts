import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log("PRODUCTS IN DB:");
  console.dir(products);

  const transactions = await prisma.transaction.findMany({
    include: { items: true }
  });
  console.log("\nTRANSACTIONS IN DB:");
  console.dir(transactions, { depth: null });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
