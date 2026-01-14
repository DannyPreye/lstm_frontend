"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useCommodities } from "@/hooks/use-commodities";
import { useHistorical } from "@/hooks/use-historical";
import { useForecast } from "@/hooks/use-forecast";
import { PriceChart } from "@/components/charts/PriceChart";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Loader2,
    Sparkles,
    TrendingUp,
    Calendar,
    Target,
} from "lucide-react";
import { formatDate } from "@/lib/utils/date-formatter";
import { formatPrice } from "@/lib/utils/price-formatter";
import { Activity, ArrowUpRight, ArrowDownRight, Info, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

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

export default function ForecastGeneratorPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <ForecastGeneratorContent />
        </Suspense>
    );
}

function ForecastGeneratorContent() {
    const [selectedCommodity, setSelectedCommodity] = useState<string>("");
    const frequency: "monthly" = "monthly"; // Always monthly
    const [horizon, setHorizon] = useState<string>("");
    const [ shouldGenerate, setShouldGenerate ] = useState(false);


    const defaultHorizon = 12; // Monthly default

    const { data: commoditiesData, isLoading: commoditiesLoading } =
        useCommodities();
    const { data: historicalData, isLoading: historicalLoading } =
        useHistorical(
            selectedCommodity || null,
            frequency,
            !!selectedCommodity && shouldGenerate
        );
    const searchParams = useSearchParams();

    useEffect(() => {
        if (commoditiesData?.commodities.length) {
            const searchCommodity = searchParams.get("commodity");
            if (searchCommodity && commoditiesData?.commodities.includes(searchCommodity)) {
                setSelectedCommodity(searchCommodity);
            }
        }
    }, [commoditiesData]);

    const {
        data: forecastData,
        isLoading: forecastLoading,
        error: forecastError,
    } = useForecast(
        selectedCommodity || null,
        frequency,
        horizon ? parseInt(horizon, 10) : defaultHorizon,
        shouldGenerate && !!selectedCommodity
    );

    const handleGenerate = () => {
        if (selectedCommodity) {
            // Use default horizon if not provided
            if (!horizon) {
                setHorizon(defaultHorizon.toString());
            }
            setShouldGenerate(true);
        }
    };

    const handleReset = () => {
        setShouldGenerate(false);
        setHorizon("");
    };

    const forecastStats = forecastData?.data && forecastData.data.length > 0 ? {
        latest: (forecastData.data[0] as any).predicted_price ?? (forecastData.data[0] as any).price,
        horizonEnd: (forecastData.data[forecastData.data.length - 1] as any).predicted_price ?? (forecastData.data[forecastData.data.length - 1] as any).price,
        max: Math.max(...forecastData.data.map(d => (d as any).predicted_price ?? d.price)),
        avg: forecastData.data.reduce((acc, curr) => acc + ((curr as any).predicted_price ?? curr.price), 0) / forecastData.data.length,
    } : null;

    const totalTrend = forecastStats && historicalData?.data && historicalData.data.length > 0
        ? ((forecastStats.horizonEnd - historicalData.data[historicalData.data.length - 1].price) / historicalData.data[historicalData.data.length - 1].price) * 100
        : 0;

    const isUpwardTrend = totalTrend >= 0;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Price Forecast</h1>
                    <p className="text-muted-foreground mt-1">
                        AI-powered predictive modeling for commodity markets.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {commoditiesLoading ? (
                        <Skeleton className="h-10 w-48" />
                    ) : (
                        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-1 shadow-sm">
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={selectedCommodity}
                                onChange={(e) => {
                                    setSelectedCommodity(e.target.value);
                                    setShouldGenerate(false);
                                }}
                                className="bg-transparent border-none focus:ring-0 text-sm font-medium py-1 pr-8"
                            >
                                <option value="">Select Commodity...</option>
                                {commoditiesData?.commodities.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Parameters Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-sm border-border/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Model Config
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="horizon" className="text-sm font-semibold">
                                    Forecast Horizon
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="horizon"
                                        type="number"
                                        placeholder={defaultHorizon.toString()}
                                        value={horizon}
                                        onChange={(e) => {
                                            setHorizon(e.target.value);
                                            setShouldGenerate(false);
                                        }}
                                        min="1"
                                        className="pr-16"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground uppercase">
                                        Months
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground flex items-start gap-1">
                                    <Info className="h-3 w-3 shrink-0 mt-0.5" />
                                    Longer horizons increase uncertainty.
                                </p>
                            </div>

                            <div className="pt-2 space-y-3">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={!selectedCommodity || forecastLoading}
                                    className="w-full shadow-sm"
                                    size="lg"
                                >
                                    {forecastLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Sparkles className="h-4 w-4 mr-2" />
                                    )}
                                    {forecastLoading ? "Calculating..." : "Run Prediction"}
                                </Button>
                                {shouldGenerate && (
                                    <Button
                                        variant="ghost"
                                        onClick={handleReset}
                                        className="w-full text-xs"
                                        size="sm"
                                    >
                                        Clear Results
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {shouldGenerate && forecastStats && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-primary/5 rounded-xl border border-primary/10 p-4 space-y-4"
                        >
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70">Forecast Insight</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {isUpwardTrend ? (
                                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs text-muted-foreground">Market Outlook</p>
                                        <p className="text-sm font-bold">{isUpwardTrend ? "Bullish Trend" : "Bearish Trend"}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Projected {Math.abs(totalTrend).toFixed(1)}% {isUpwardTrend ? "increase" : "decrease"} over the next {horizon || defaultHorizon} months.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                    {!shouldGenerate ? (
                        <Card className="border-dashed border-2 bg-muted/30 h-[500px] flex items-center justify-center">
                            <div className="text-center space-y-4 max-w-sm">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <Sparkles className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Predictive Intelligence</h3>
                                    <p className="text-muted-foreground">
                                        Our LSTM model analyzes historical patterns to generate future price movements. Configure parameters to start.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <>
                            {/* Forecast Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {forecastLoading ? (
                                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
                                ) : (
                                    <>
                                        <Card className="border-none bg-card shadow-sm">
                                            <CardContent className="pt-6">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Horizon End Target</p>
                                                <div className="mt-2 flex items-baseline gap-2">
                                                    <h3 className="text-2xl font-bold">{formatPrice(forecastStats?.horizonEnd || 0)}</h3>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-none bg-card shadow-sm">
                                            <CardContent className="pt-6">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Projected Peak</p>
                                                <div className="mt-2 flex items-baseline gap-2">
                                                    <h3 className="text-2xl font-bold">{formatPrice(forecastStats?.max || 0)}</h3>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-none bg-card shadow-sm">
                                            <CardContent className="pt-6">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg. Prediction</p>
                                                <div className="mt-2 flex items-baseline gap-2">
                                                    <h3 className="text-2xl font-bold">{formatPrice(forecastStats?.avg || 0)}</h3>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>

                            {/* Chart Card */}
                            <Card className="border-none bg-card shadow-sm overflow-hidden">
                                <CardContent className="p-0">
                                    {forecastLoading || historicalLoading ? (
                                        <Skeleton className="h-[450px] w-full" />
                                    ) : (
                                        <PriceChart
                                            historicalData={historicalData?.data || []}
                                            forecastData={forecastData?.data || []}
                                            frequency={frequency}
                                            commodity={selectedCommodity}
                                        />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Table Area */}
                            {!forecastLoading && forecastData?.data && (
                                <Card className="border-none bg-card shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">Detailed Projections</CardTitle>
                                            <CardDescription>Estimated prices for the selected horizon.</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-lg border overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead>Target Date</TableHead>
                                                        <TableHead className="text-right">Projected Price</TableHead>
                                                        <TableHead className="text-center">Confidence</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {forecastData.data.map((item, i) => (
                                                        <TableRow key={i} className="hover:bg-muted/5 transition-colors">
                                                            <TableCell className="font-medium">{formatDate(item.date)}</TableCell>
                                                            <TableCell className="text-right font-bold text-primary">
                                                                {formatPrice((item as any).predicted_price ?? item.price)}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                                                                    High
                                                                </span>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {forecastError && (
                                <div className="p-6 bg-destructive/5 border border-destructive/10 rounded-xl flex items-center gap-4 text-destructive">
                                    <AlertCircle className="h-6 w-6" />
                                    <div>
                                        <p className="font-bold">Model execution failed</p>
                                        <p className="text-sm opacity-80">{forecastError.message}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

