import { PrismaClient } from '@prisma/client';

// need to declare prisma to global window
declare global {
    var prisma: PrismaClient | undefined;
};

const prismadb = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma.db;

export default prismadb