import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis;
globalForPrisma.prisma = globalForPrisma.prisma || undefined;

const adapter = new PrismaLibSQL({
	url: process.env.URL,
	authToken: process.env.TOKEN,
});

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
