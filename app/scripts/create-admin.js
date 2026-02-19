const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    const email = 'admin@civilllm.com';
    const password = 'Hoax@6692';
    const name = 'Admin';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // Update to admin if exists
            const user = await prisma.user.update({
                where: { email },
                data: {
                    role: 'ADMIN',
                    hashedPassword: hashedPassword
                }
            });
            console.log('User updated to ADMIN:', user.email);
        } else {
            // Create new admin user
            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    hashedPassword: hashedPassword,
                    role: 'ADMIN',
                }
            });
            console.log('Admin user created:', user.email);
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();
