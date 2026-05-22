import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

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
