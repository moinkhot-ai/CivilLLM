
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking Users in Database...');
    const users = await prisma.user.findMany({
        include: { accounts: true }
    });

    if (users.length === 0) {
        console.log('❌ No users found.');
    } else {
        console.log(`✅ Found ${users.length} users:`);
        users.forEach(u => {
            console.log('------------------------------------------------');
            console.log(`ID:       ${u.id}`);
            console.log(`Name:     ${u.name}`);
            console.log(`Email:    ${u.email}`);
            console.log(`Role:     ${u.role}`);
            console.log(`Accounts: ${u.accounts.length} linked providers`);
            u.accounts.forEach(a => {
                console.log(`  - Provider: ${a.provider}, ID: ${a.providerAccountId}`);
            });
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
