import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthService } from "@/lib/api/services/AuthService";
import type { AuthTokenRequest } from "@/lib/api/models/AuthTokenRequest";
import type { ApiError } from "@/lib/api/core/ApiError";

/**
 * Helper function to refresh access token using the refresh token
 */
async function refreshAccessToken(token: any)
{
    try {
        const refreshedTokens = await AuthService.authTokenRefreshCreate({
            refresh: token.refreshToken,
        });

        if (!refreshedTokens.access) {
            throw new Error("Failed to refresh token");
        }

        return {
            ...token,
            accessToken: refreshedTokens.access,
            accessTokenExpires: Date.now() + 5 * 60 * 1000, // 5 mins fallback
            refreshToken: refreshedTokens.refresh ?? token.refreshToken, // Fall back to old refresh token
        };
    } catch (error) {
        console.error("RefreshTokenError", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

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
                    console.error("AuthorizeError", error);
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
        async jwt({ token, user, account })
        {
            // Initial sign in
            if (user && account) {
                return {
                    accessToken: (user as any).accessToken,
                    refreshToken: (user as any).refreshToken,
                    accessTokenExpires: Date.now() + 5 * 60 * 1000, // Assume 5 mins if not provided
                    user,
                };
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token as any).accessTokenExpires) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session({ session, token })
        {
            if (token) {
                (session as any).user = (token as any).user;
                (session as any).accessToken = token.accessToken;
                (session as any).error = (token as any).error;
            }
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
