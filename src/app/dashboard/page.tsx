"use client";

import { motion } from "framer-motion";
import { useCommodities } from "@/hooks/use-commodities";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    BarChart3,
    ArrowUpRight,
} from "lucide-react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
};

export default function DashboardPage() {
    const { data: commoditiesData, isLoading: commoditiesLoading } =
        useCommodities();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-7xl mx-auto"
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of available commodity data and system status.
                </p>
            </div>

            {/* Quick Stats Row */}
            <motion.div
                variants={itemVariants}
                className="grid gap-6 md:grid-cols-3"
            >
                <Card className="shadow-sm border-border/50 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Commodities
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {commoditiesLoading ? (
                                <Skeleton className="h-9 w-20" />
                            ) : (
                                commoditiesData?.commodities.length || 0
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Monitored market assets
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            System Status
                        </CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">Operational</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            API & Backend Services
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50 hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Data Frequency
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold uppercase tracking-tight">Monthly</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Last sync: {new Date().toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Managed Commodities List */}
            <motion.div variants={itemVariants}>
                <Card className="shadow-sm border-border/50">
                    <CardHeader>
                        <CardTitle>Monitored Commodities</CardTitle>
                        <CardDescription>
                            List of all commodities currently available for analysis and forecasting.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {commoditiesLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {commoditiesData?.commodities.map((commodity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all cursor-pointer group"
                                        onClick={() => window.location.href = `/dashboard/historical?commodity=${commodity}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <TrendingUp className="h-5 w-5" />
                                            </div>
                                            <span className="font-semibold text-lg">{commodity}</span>
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {!commoditiesLoading && (!commoditiesData?.commodities || commoditiesData.commodities.length === 0) && (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                No commodities found in the database.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}

