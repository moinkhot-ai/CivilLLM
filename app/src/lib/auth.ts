import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma'; // Import prisma client

// Demo mode code removed for production


export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-client-secret',
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log('🔐 [AUTH] Attempting login for:', credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ [AUTH] Missing email or password');
                    throw new Error('Invalid credentials');
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user || !user.hashedPassword) {
                    console.log('❌ [AUTH] User not found or no password hash:', credentials.email);
                    throw new Error('Invalid credentials');
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                );

                console.log('🔍 [AUTH] Password check result:', isCorrectPassword);

                if (!isCorrectPassword) {
                    console.log('❌ [AUTH] Password mismatch for:', credentials.email);
                    throw new Error('Invalid credentials');
                }

                console.log('✅ [AUTH] Login successful for:', user.email);
                return user;
            }
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role || 'USER';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.id as string;
                (session.user as { role?: string }).role = token.role as string;
            }
            return session;
        },
    },
    debug: process.env.NODE_ENV === 'development',
};


// Helper functions
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function isAdmin(role: string): boolean {
    return role === 'ADMIN' || role === 'SUPERADMIN';
}
