import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req)
    {
        const token = req.nextauth.token;
        // Access pathname from the request - NextRequestWithAuth extends NextRequest
        const request = req as any;
        const pathname = request.nextUrl?.pathname || "";

        // Redirect authenticated users away from auth pages
        if (token && (pathname === "/login" || pathname === "/register")) {
            const origin = request.nextUrl?.origin || "http://localhost:3000";
            const dashboardUrl = new URL("/dashboard", origin);
            return NextResponse.redirect(dashboardUrl);
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) =>
            {
                const pathname = req.nextUrl.pathname;

                // Protect dashboard routes - require authentication
                if (pathname.startsWith("/dashboard")) {
                    return !!token;
                }

                // Allow access to auth pages (they will be redirected in the middleware function if authenticated)
                return true;
            },
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [ "/dashboard/:path*", "/login", "/register" ],
};
