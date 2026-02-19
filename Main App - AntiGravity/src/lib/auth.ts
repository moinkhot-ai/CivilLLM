import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Demo mode: In-memory user storage (shared with signup route)
// In production, this would use Prisma/database
const demoUsers: Map<string, { id: string; email: string; name: string; hashedPassword: string; role: string }> = new Map();

// Add a demo user for easy testing
demoUsers.set('demo@civilllm.com', {
    id: 'demo-user-1',
    email: 'demo@civilllm.com',
    name: 'Demo User',
    hashedPassword: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4aLQHkMKQgZkKmHe', // password: demo1234
    role: 'USER',
});

export const authOptions: NextAuthOptions = {
    // No adapter in demo mode - using JWT only
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-client-secret',
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                // Check demo users
                const user = demoUsers.get(credentials.email);

                if (!user) {
                    // For demo: allow any signup to work by creating user on-the-fly
                    console.log('Demo mode: User not found, trying to authenticate anyway');
                    throw new Error('Invalid email or password. Try demo@civilllm.com with password: demo1234');
                }

                const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
                if (!isValid) {
                    throw new Error('Invalid email or password');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
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

export default NextAuth(authOptions);

// Helper to register demo users (called from signup API)
export function registerDemoUser(email: string, name: string, hashedPassword: string): string {
    const id = `demo-${Date.now()}`;
    demoUsers.set(email, { id, email, name, hashedPassword, role: 'USER' });
    return id;
}

// Helper to check if demo user exists
export function getDemoUser(email: string) {
    return demoUsers.get(email);
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function isAdmin(role: string): boolean {
    return role === 'ADMIN' || role === 'SUPERADMIN';
}
