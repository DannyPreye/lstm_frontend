import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "@/lib/api/services/AuthService";
import type { AuthTokenRequest } from "@/lib/api/models/AuthTokenRequest";
import type { ApiError } from "@/lib/api/core/ApiError";

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
                    throw new Error("Username and password are required");
                }

                try {
                    const tokenRequest: AuthTokenRequest = {
                        username: credentials.username,
                        password: credentials.password,
                    };

                    const authToken = await AuthService.authTokenCreate(tokenRequest);



                    // Handle both response formats: { token } or { access, refresh }
                    const accessToken = (authToken as any).access || (authToken as any).token;
                    const refreshToken = (authToken as any).refresh;

                    if (!accessToken) {
                        throw new Error("Invalid credentials");
                    }

                    return {
                        id: credentials.username,
                        name: credentials.username,
                        email: credentials.username,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                    };
                } catch (error: any) {
                    console.error(error);
                    const apiError = error as ApiError;
                    if (apiError.status === 401) {

                        throw new Error("Invalid username or password");
                    }
                    throw new Error(apiError.message || "Authentication failed");
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user })
        {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.refreshToken = (user as any).refreshToken;
                token.id = user.id;
            }

            console.log("jwt token", token);
            return token;
        },
        async session({ session, token })
        {
            if (token) {
                (session as any).accessToken = token.accessToken;
                (session as any).user.id = token.id;
            }
            console.log("session token", token);
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
