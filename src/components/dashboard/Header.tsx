"use client";

import { usePathname } from "next/navigation";
import { UserCircle } from "lucide-react";
import { useSession } from "next-auth/react";

export function Header() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const getPageTitle = (path: string) => {
        switch (path) {
            case "/dashboard":
                return "Dashboard Overview";
            case "/dashboard/forecast":
                return "Forecast Generator";
            case "/dashboard/historical":
                return "Historical Data";
            default:
                return "Dashboard";
        }
    };

    return (
        <header className="h-16 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground/90">
                    {getPageTitle(pathname)}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pl-4 border-l border-border/40">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none text-foreground">
                            {session?.user?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {session?.user?.email || "Analyst"}
                        </p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                </div>
            </div>
        </header>
    );
}
