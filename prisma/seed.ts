import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrpyt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

await prisma.$executeRawUnsafe(`TRUNCATE TABLE "item-categories" RESTART IDENTITY CASCADE;`);
await prisma.$executeRawUnsafe(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`);

const jodo = await prisma.user.create({
    data: {
        firstName: "John",
        lastName: "Doe",
        createdAt: "2026-04-29T00:26:52.198Z",
        username: "jodo",
        passwordHash: await bcrpyt.hash("pword", 10),
        createdByUserId: null,
        role: "admin"
    },
    omit: { passwordHash: true }
});

const jsmith = await prisma.user.create({
    data: {
        firstName: "Jane",
        lastName: "Smith",
        createdAt: "2026-04-29T00:30:49.928Z",
        username: "jsmithy",
        passwordHash: await bcrpyt.hash("1234", 10),
        createdByUserId: jodo.id
    },
    omit: { passwordHash: true }
});

/*
 * Test category tree
 *   Hardware
 *     Bolts
 *       Nylon
 *       Metal
 *     Nuts
 *     Washers
 *   Office Supplies
 *     Cleaning
 *     Cooking
 */

const hardware = await prisma.itemCategory.create({
    data: {
        name: "Hardware",
        createdByUserId: jodo.id,
        createdAt: "2026-05-01T19:11:36.148Z",
        parentId: null
    }
});

const bolts = await prisma.itemCategory.create({
    data: {
        name: "Bolts",
        createdByUserId: jsmith.id,
        createdAt: "2026-05-01T19:14:49.482Z",
        parentId: hardware.id
    }
});

await prisma.itemCategory.create({
    data: {
        name: "Nylon",
        createdByUserId: jsmith.id,
        createdAt: "2026-05-01T19:15:17.094Z",
        parentId: bolts.id
    }
});

await prisma.itemCategory.create({
    data: {
        name: "Metal",
        createdByUserId: jsmith.id,
        createdAt: "2026-05-01T19:15:20.481Z",
        parentId: bolts.id
    }
});

await prisma.itemCategory.create({
    data: {
        name: "Nuts",
        createdByUserId: jsmith.id,
        createdAt: "2026-05-01T19:16:00.144Z",
        parentId: hardware.id
    }
});

await prisma.itemCategory.create({
    data: {
        name: "Washers",
        createdByUserId: jsmith.id,
        createdAt: "2026-05-01T19:16:32.748Z",
        parentId: hardware.id
    }
});

const supplies = await prisma.itemCategory.create({
    data: {
        name: "Office Supplies",
        createdByUserId: jodo.id,
        createdAt: "2026-05-01T19:12:25.927Z",
        parentId: null
    }
});

await prisma.itemCategory.create({
    data: {
        name: "Cleaning",
        createdByUserId: jodo.id,
        createdAt: "2026-05-01T19:13:14.181Z",
        parentId: supplies.id
    }
});

await prisma.itemCategory.create({
    data: {
        name: "Cooking",
        createdByUserId: jodo.id,
        createdAt: "2026-05-01T19:17:14.080Z",
        parentId: supplies.id
    }
});

process.exit(0);