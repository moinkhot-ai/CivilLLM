
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPass() {
    const email = 'admin@civilllm.com';
    const password = 'admin123';

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { email },
            data: { hashedPassword }
        });
        console.log('✅ Password reset to: admin123');
    } catch (error) {
        console.error('❌ Error resetting password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPass();
