
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log('✅ Users found in DB:', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('❌ Error connecting/finding users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
