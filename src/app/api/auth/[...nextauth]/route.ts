import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
}

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = db.getUserByEmail(credentials.email);

                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

                if (!isValid) {
                    return null;
                }

                return { id: user.id, email: user.email, name: user.name };
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.sub as string;
                // Fetch latest user data to ensure profile updates are reflected immediately
                const user = db.getUserById(token.sub as string);
                if (user) {
                    session.user.name = user.name;
                    session.user.email = user.email;
                    session.user.image = user.photoUrl;
                }
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    },
    session: {
        strategy: 'jwt' as const,
    },
    secret: 'supersecretkey123', // In production, use process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
