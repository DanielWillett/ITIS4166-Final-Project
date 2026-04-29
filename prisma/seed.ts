import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrpyt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });


await prisma.$executeRawUnsafe(`TRUNCATE TABLE "users" CASCADE;`);

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

await prisma.user.create({
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