
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Users:');
    const users = await prisma.user.findMany({
        include: { accounts: true }
    });

    if (users.length === 0) {
        console.log('No users found.');
    } else {
        users.forEach(u => {
            const accounts = u.accounts.map(a => `${a.provider}(${a.providerAccountId.substring(0, 5)}...)`).join(', ');
            console.log(`[${u.role}] ${u.email} (ID: ${u.id.substring(0, 8)}...) - Linked: ${accounts || 'None'}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
