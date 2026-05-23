import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning database...");

  // Delete in dependency order (children before parents)
  const deletedItems = await prisma.transactionItem.deleteMany();
  console.log(`  ✓ Deleted ${deletedItems.count} transaction items`);

  const deletedTransactions = await prisma.transaction.deleteMany();
  console.log(`  ✓ Deleted ${deletedTransactions.count} transactions`);

  const deletedInvoices = await prisma.invoice.deleteMany();
  console.log(`  ✓ Deleted ${deletedInvoices.count} invoices`);

  const deletedCustomers = await prisma.customer.deleteMany();
  console.log(`  ✓ Deleted ${deletedCustomers.count} customers`);

  const deletedProducts = await prisma.product.deleteMany();
  console.log(`  ✓ Deleted ${deletedProducts.count} products`);

  console.log("\n✅ Database successfully cleaned! Starting from blank slate.");
}

main()
  .catch((e) => {
    console.error("❌ Error during database clean:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
