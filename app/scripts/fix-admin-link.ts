
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🛠️  Fixing Admin Account Link (Removing ALL external providers)...');

    const adminEmail = 'admin@civilllm.com';

    const admin = await prisma.user.findUnique({
        where: { email: adminEmail },
        include: { accounts: true }
    });

    if (!admin) {
        console.log('❌ Admin user not found.');
        return;
    }

    if (admin.accounts.length > 0) {
        console.log(`⚠️  Found ${admin.accounts.length} linked accounts. Removing them...`);

        // Delete all linked accounts for this user
        await prisma.account.deleteMany({
            where: { userId: admin.id }
        });

        console.log('✅ Successfully UNLINKED all providers from Admin.');
    } else {
        console.log('✅ Admin has no linked accounts. All good.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
