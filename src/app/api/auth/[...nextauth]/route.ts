import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "@/lib/api";
import type { AuthTokenRequest } from "@/types/api";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials)
            {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                try {
                    const response = await api.authToken({
                        username: credentials.username,
                        password: credentials.password,
                    });

                    // The API returns a token, but we need to decode it to get user info
                    // For now, we'll store the token and username
                    return {
                        id: credentials.username,
                        name: credentials.username,
                        email: credentials.username,
                        accessToken: response.token,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user })
        {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token })
        {
            if (session.user) {
                session.user.id = token.id as string;
                (session as any).accessToken = token.accessToken;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

