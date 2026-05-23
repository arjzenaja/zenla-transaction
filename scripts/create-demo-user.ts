import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    const email = "demo@zenla.com";
    const plainPassword = "Demo@123456";
    const shopName = "Demo Shop";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`✓ Demo user already exists: ${email}`);
      console.log(`  Password: ${plainPassword}`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        shopName,
      },
    });

    console.log("✓ Demo user created successfully!");
    console.log(`\nLogin Details:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${plainPassword}`);
    console.log(`  Shop Name: ${shopName}`);
  } catch (error) {
    console.error("✗ Error creating demo user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
