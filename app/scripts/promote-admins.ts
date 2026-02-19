
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
    'moinkhot23.3@gmail.com',
    'moinlgn@gmail.com'
];

async function main() {
    console.log('👑 Promoting Users to ADMIN...');

    for (const email of ADMIN_EMAILS) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            console.log(`✅ Promoted ${email} to ADMIN.`);
        } else {
            console.log(`⚠️  User ${email} not found. (They need to sign in first).`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
