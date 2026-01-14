"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    LineChart,
    History,
    LogOut,
    Settings,
    ChevronRight,
    TrendingUp,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Forecast",
        href: "/dashboard/forecast",
        icon: LineChart,
    },
    {
        title: "Historical",
        href: "/dashboard/historical",
        icon: History,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: "/login" });
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r border-border/40 bg-background/95 backdrop-blur-xl z-50"
        >
            {/* Logo Area */}
            <div className="p-6 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                        PriceCast
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 flex flex-col gap-1 px-3">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                <span className="font-medium">{item.title}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="ml-auto"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </motion.div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* User/Footer Area */}
            <div className="p-4 border-t border-border/40 space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </Button>
                <div className="text-xs text-center text-muted-foreground/50 pt-2">
                    v1.0.0 • Enterprise Edition
                </div>
            </div>
        </motion.div>
    );
}
