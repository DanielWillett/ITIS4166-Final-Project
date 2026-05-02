import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrpyt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

await prisma.$executeRawUnsafe(`TRUNCATE TABLE "stock-item-records" RESTART IDENTITY CASCADE;`);
await prisma.$executeRawUnsafe(`TRUNCATE TABLE "stock-items" RESTART IDENTITY CASCADE;`);
await prisma.$executeRawUnsafe(`TRUNCATE TABLE "items" RESTART IDENTITY CASCADE;`);
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
        createdByUserId: jodo.id,
        role: "write"
    },
    omit: { passwordHash: true }
});

await prisma.user.create({
    data: {
        firstName: "Guest",
        lastName: "User",
        createdAt: "2026-05-01T04:18:21.542Z",
        username: "guest",
        passwordHash: await bcrpyt.hash("$guest$", 10),
        createdByUserId: jodo.id,
        role: "read"
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

const metalBolts = await prisma.itemCategory.create({
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

const cleaningSupplies = await prisma.itemCategory.create({
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

/* Stock */

const bolt = await prisma.item.create({
    data: {
        name: "BOLT HEX HEAD HEX SOCKET 1/2\"-13",
        description: "1/2\"-13 Hex Head Bolt Hex Socket Drive Steel",
        categoryId: metalBolts.id,
        createdAt: "2026-05-01T22:55:12.181Z",
        createdByUserId: jodo.id
    }
});

const boltStock1 = await prisma.stockItem.create({
    data: {
        quantity: 495,
        location: "Bldg 1A, Room 114, Shelf 3",
        createdByUserId: jodo.id,
        itemId: bolt.id,
        manufacturer: "Kanebridge",
        vendor: "DigiKey",
        url: "https://www.digikey.com/en/products/detail/fix-supply/5032BHH7/21649245",
        createdAt: "2026-05-01T22:55:34.982Z"
    }
});
await prisma.stockItemRecord.create({
    data: {
        description: "Created",
        fieldId: 0,
        oldValue: "",
        timestamp: "2026-05-01T22:55:34.982Z",
        stockItemId: boltStock1.id,
        userId: jodo.id
    }
});

const boltStock2 = await prisma.stockItem.create({
    data: {
        quantity: 11,
        location: "Bldg 1A, Room 120, Desk 4",
        createdByUserId: jodo.id,
        itemId: bolt.id,
        manufacturer: "Generic",
        vendor: "Amazon",
        url: "https://www.amazon.com/Heavy-Bolt-Grade-Plain-ECS-5032BHH7/dp/B0CVNLHBY6",
        createdAt: "2026-05-01T22:55:58.019Z"
    }
});
await prisma.stockItemRecord.create({
    data: {
        description: "Created",
        fieldId: 0,
        oldValue: "",
        timestamp: "2026-05-01T22:55:58.019Z",
        stockItemId: boltStock2.id,
        userId: jodo.id
    }
});

await prisma.stockItemRecord.create({
    data: {
        description: "Property quantity changed to '11'",
        fieldId: 1,
        oldValue: "12",
        timestamp: "2026-05-01T23:01:12.304Z",
        stockItemId: boltStock2.id,
        userId: jsmith.id
    }
});

const paperTowels = await prisma.item.create({
    data: {
        name: "Paper Towels",
        description: "1 roll of paper towels",
        categoryId: cleaningSupplies.id,
        createdAt: "2026-05-01T22:44:08.418Z",
        createdByUserId: jsmith.id
    }
});

const paperTowelStock1 = await prisma.stockItem.create({
    data: {
        quantity: 6,
        location: "Bldg 1A, Room 11",
        createdByUserId: jsmith.id,
        itemId: paperTowels.id,
        vendor: "Walmart",
        createdAt: "2026-05-01T22:44:12.684Z"
    }
});
await prisma.stockItemRecord.create({
    data: {
        description: "Created",
        fieldId: 0,
        oldValue: "",
        timestamp: "2026-05-01T22:44:12.684Z",
        stockItemId: paperTowelStock1.id,
        userId: jsmith.id
    }
});
await prisma.stockItemRecord.create({
    data: {
        description: "Property location changed to 'Bldg 1A, Room 11'",
        fieldId: 5,
        oldValue: "Bldg 1A, Room 4",
        timestamp: "2026-05-02T05:04:46.011Z",
        stockItemId: paperTowelStock1.id,
        userId: jodo.id
    }
});


prisma.$disconnect();
process.exit(0);