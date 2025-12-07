"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCommodities } from "@/hooks/use-commodities";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Loader2,
    TrendingUp,
    BarChart3,
    LineChart,
    LogOut,
    Package,
    Brain,
    ArrowRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
} as const;

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const { data: commoditiesData, isLoading: commoditiesLoading } =
        useCommodities();
    const [selectedCommodity, setSelectedCommodity] = useState<string>("");

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: "/login" });
    };

    return (
        <div className='min-h-screen bg-background p-4 md:p-8'>
            <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='max-w-7xl mx-auto space-y-6'
            >
                {/* Header */}
                <motion.div
                    variants={itemVariants}
                    className='flex justify-between items-center'
                >
                    <div>
                        <h1 className='text-3xl font-bold text-foreground'>
                            Welcome back, {session?.user?.name || "User"}
                        </h1>
                        <p className='text-muted-foreground mt-1'>
                            Explore commodity price forecasts and historical
                            data
                        </p>
                    </div>
                    <Button
                        variant='outline'
                        onClick={handleLogout}
                        className='flex items-center gap-2 shadow-sm'
                    >
                        <LogOut className='h-4 w-4' />
                        Logout
                    </Button>
                </motion.div>

                {/* Commodity Selector */}
                <motion.div variants={itemVariants}>
                    <Card className='shadow-lg border-border/50'>
                        <CardHeader className='pb-4'>
                            <CardTitle className='text-xl flex items-center gap-2'>
                                <Package className='h-5 w-5 text-primary' />
                                Select Commodity
                            </CardTitle>
                            <CardDescription>
                                Choose a commodity to view forecasts and
                                historical data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {commoditiesLoading ? (
                                <Skeleton className='h-10 w-full' />
                            ) : (
                                <Select
                                    value={selectedCommodity}
                                    onChange={(e) =>
                                        setSelectedCommodity(e.target.value)
                                    }
                                    className='w-full'
                                >
                                    <option value=''>
                                        Select a commodity...
                                    </option>
                                    {commoditiesData?.commodities.map(
                                        (commodity) => (
                                            <option
                                                key={commodity}
                                                value={commodity}
                                            >
                                                {commodity}
                                            </option>
                                        )
                                    )}
                                </Select>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    variants={itemVariants}
                    className='grid grid-cols-1 md:grid-cols-2 gap-6'
                >
                    <Card className='shadow-lg border-border/50 hover:shadow-xl transition-shadow'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                            <CardTitle className='text-base font-semibold'>
                                Available Commodities
                            </CardTitle>
                            <div className='rounded-full bg-primary/10 p-2'>
                                <TrendingUp className='h-5 w-5 text-primary' />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className='text-3xl font-bold text-foreground mb-1'>
                                {commoditiesData?.commodities.length || 0}
                            </div>
                            <p className='text-sm text-muted-foreground'>
                                Commodities available for forecasting
                            </p>
                        </CardContent>
                    </Card>

                    <Card className='shadow-lg border-border/50 hover:shadow-xl transition-shadow'>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-3'>
                            <CardTitle className='text-base font-semibold'>
                                Forecast Models
                            </CardTitle>
                            <div className='rounded-full bg-primary/10 p-2'>
                                <Brain className='h-5 w-5 text-primary' />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className='text-3xl font-bold text-foreground mb-1'>
                                LSTM
                            </div>
                            <p className='text-sm text-muted-foreground'>
                                Deep learning forecasting model
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Navigation Cards */}
                <motion.div
                    variants={itemVariants}
                    className='grid grid-cols-1 md:grid-cols-2 gap-6'
                >
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Link href='/dashboard/historical'>
                            <Card className='cursor-pointer hover:border-primary hover:shadow-xl transition-all h-full shadow-lg border-border/50 group'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='flex items-center justify-between text-xl'>
                                        <div className='flex items-center gap-3'>
                                            <div className='rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors'>
                                                <BarChart3 className='h-6 w-6 text-primary' />
                                            </div>
                                            <span>Historical Viewer</span>
                                        </div>
                                        <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
                                    </CardTitle>
                                    <CardDescription className='mt-2'>
                                        Explore historical price data for
                                        commodities
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-sm text-muted-foreground leading-relaxed'>
                                        View past price trends, analyze
                                        patterns, and export data for analysis.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Link href='/dashboard/forecast'>
                            <Card className='cursor-pointer hover:border-primary hover:shadow-xl transition-all h-full shadow-lg border-border/50 group'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='flex items-center justify-between text-xl'>
                                        <div className='flex items-center gap-3'>
                                            <div className='rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors'>
                                                <LineChart className='h-6 w-6 text-primary' />
                                            </div>
                                            <span>Forecast Generator</span>
                                        </div>
                                        <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
                                    </CardTitle>
                                    <CardDescription className='mt-2'>
                                        Generate LSTM-based price forecasts
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-sm text-muted-foreground leading-relaxed'>
                                        Create custom forecasts with adjustable
                                        parameters and visualize predictions.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
