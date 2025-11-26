"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='text-muted-foreground'>Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const handleSignOut = async () => {
        await signOut({ redirect: true, callbackUrl: "/login" });
    };

    return (
        <div className='min-h-screen bg-background'>
            <header className='border-b border-border bg-card'>
                <div className='container mx-auto flex h-16 items-center justify-between px-4'>
                    <div className='flex items-center gap-2'>
                        <TrendingUp className='h-6 w-6 text-primary' />
                        <h1 className='text-xl font-bold'>
                            Commodity Forecasting
                        </h1>
                    </div>
                    <div className='flex items-center gap-4'>
                        <span className='text-sm text-muted-foreground'>
                            {session.user?.name || session.user?.email}
                        </span>
                        <ThemeToggle />
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleSignOut}
                        >
                            <LogOut className='mr-2 h-4 w-4' />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>
            <main className='container mx-auto px-4 py-8'>{children}</main>
        </div>
    );
}
