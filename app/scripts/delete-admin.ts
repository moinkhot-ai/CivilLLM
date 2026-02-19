
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Deleting Admin User...');

    const adminEmail = 'admin@civilllm.com';

    const deleted = await prisma.user.deleteMany({
        where: { email: adminEmail }
    });

    if (deleted.count > 0) {
        console.log(`✅ Successfully deleted Admin user.`);
    } else {
        console.log('⚠️  Admin user not found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
