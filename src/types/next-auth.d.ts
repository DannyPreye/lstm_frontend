import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            accessToken?: string;
            username?: string;
        };
    }

    interface User {
        accessToken?: string;
        username?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        username?: string;
    }
}





