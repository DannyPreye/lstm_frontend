"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useCommodities } from "@/hooks/use-commodities";
import { useHistorical } from "@/hooks/use-historical";
import { PriceChart } from "@/components/charts/PriceChart";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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
    Download,
    TrendingUp,
    Calendar,
    Search,
} from "lucide-react";
import { formatDate } from "@/lib/utils/date-formatter";
import { formatPrice } from "@/lib/utils/price-formatter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useBulkPrices } from "@/hooks/use-bulk-prices";
import { AlertCircle, CheckCircle2, Info, ArrowUpRight, ArrowDownRight, Activity, FileSpreadsheet, Upload } from "lucide-react";
import { generateExcelTemplate, parseExcelTemplate } from "@/lib/utils/excel-handler";
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

export default function HistoricalViewerPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <HistoricalViewerContent />
        </Suspense>
    );
}

function HistoricalViewerContent() {
    const [selectedCommodity, setSelectedCommodity] = useState<string>("");
    const frequency: "monthly" = "monthly"; // Always monthly
    const { data: commoditiesData, isLoading: commoditiesLoading } =
        useCommodities();
    const {
        data: historicalData,
        isLoading: historicalLoading,
        error: historicalError,
    } = useHistorical(
        selectedCommodity || null,
        frequency,
        !!selectedCommodity
        );
      const searchParams = useSearchParams();

    console.log(searchParams.get("commodity"))


    useEffect(()=>{
        if (commoditiesData?.commodities.length) {
            const searchCommodity = searchParams.get("commodity");
            if(searchCommodity && commoditiesData?.commodities.includes(searchCommodity)){
                setSelectedCommodity(searchCommodity);
            }else{
                setSelectedCommodity(commoditiesData?.commodities[0]);
            }
        }
    },[commoditiesData])

    const {
        submitBulkPrices,
        isLoading: isSubmitting,
        error: submitError,
        success: submitSuccess,
        setSuccess: setSubmitSuccess
    } = useBulkPrices();

    const [bulkYear, setBulkYear] = useState<number>(2025);
    const [bulkPrices, setBulkPrices] = useState<Record<number, string>>({});

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await submitBulkPrices(selectedCommodity, bulkYear, bulkPrices);
        if (success) {
            setBulkPrices({});
            // Refresh historical data
            // In a real app, you might want to invalidate the query
        }
    };

    const handlePriceChange = (month: number, value: string) => {
        setBulkPrices(prev => ({ ...prev, [month]: value }));
        setSubmitSuccess(false);
    };

    const handleDownloadTemplate = () => {
        generateExcelTemplate(selectedCommodity, bulkYear);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const extractedPrices = await parseExcelTemplate(file);
            if (Object.keys(extractedPrices).length === 0) {
                // You might want to show an error here
                return;
            }
            setBulkPrices(extractedPrices);
            setSubmitSuccess(false);
        } catch (err: any) {
            console.error("Error parsing Excel:", err);
            // Handle error (use setSubmitError if you want)
        }
    };

    const stats = historicalData?.data ? {
        max: Math.max(...historicalData.data.map(d => d.price)),
        min: Math.min(...historicalData.data.map(d => d.price)),
        avg: historicalData.data.reduce((acc, curr) => acc + curr.price, 0) / historicalData.data.length,
        latest: historicalData.data[historicalData.data.length - 1]?.price,
        previous: historicalData.data[historicalData.data.length - 2]?.price,
    } : null;

    const priceChange = stats?.latest && stats?.previous
        ? ((stats.latest - stats.previous) / stats.previous) * 100
        : 0;

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleExportCSV = () => {
        if (!historicalData?.data) return;

        // Check if season_flag exists in the data
        const hasSeasonFlag = historicalData.data.some(
            (item) => (item as any).season_flag !== undefined
        );

        const headers = hasSeasonFlag
            ? ["Date", "Price", "Season Flag", "Season"]
            : ["Date", "Price"];

        const rows = historicalData.data.map((item) => {
            const datePart = item.date.includes("T")
                ? item.date.split("T")[0]
                : item.date;
            const baseRow = [datePart, item.price.toString()];

            if (hasSeasonFlag) {
                const seasonFlag = (item as any).season_flag;
                const season =
                    seasonFlag === 1 ? "Peak" : seasonFlag === -1 ? "Off" : "";
                baseRow.push(seasonFlag?.toString() || "", season);
            }

            return baseRow;
        });

        const csvContent = [headers, ...rows]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedCommodity}_historical_monthly.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

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
                    <h1 className="text-3xl font-bold tracking-tight">Historical Data</h1>
                    <p className="text-muted-foreground mt-1">
                        Explore past performance and update market prices.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {commoditiesLoading ? (
                        <Skeleton className="h-10 w-48" />
                    ) : (
                        <div className="flex items-center gap-2 bg-background border rounded-lg px-3 py-1 shadow-sm">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={selectedCommodity}
                                onChange={(e) => setSelectedCommodity(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm font-medium py-1 pr-8"
                            >
                                <option value="">Select Commodity...</option>
                                {commoditiesData?.commodities.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {historicalData?.data && historicalData.data.length > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleExportCSV}
                            size="sm"
                            className="h-10"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {!selectedCommodity ? (
                <Card className="border-dashed border-2 bg-muted/30 h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-sm">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Activity className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">No Commodity Selected</h3>
                            <p className="text-muted-foreground">
                                Select a commodity from the dropdown above to view historical trends and manage prices.
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <Tabs defaultValue="analysis" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                            <TabsTrigger value="analysis">Price Analysis</TabsTrigger>
                            <TabsTrigger value="entry">Bulk Data Entry</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="analysis" className="space-y-6">
                        {/* Stats Grid */}
                        {historicalLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-24 rounded-xl" />
                                ))}
                            </div>
                        ) : stats ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-primary/5 border-primary/10">
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-muted-foreground">Latest Price</p>
                                            <Activity className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="mt-2 flex items-baseline gap-2">
                                            <h3 className="text-2xl font-bold">{formatPrice(stats.latest)}</h3>
                                            <span className={cn(
                                                "text-xs font-bold flex items-center",
                                                priceChange >= 0 ? "text-green-500" : "text-red-500"
                                            )}>
                                                {priceChange >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                                                {Math.abs(priceChange).toFixed(1)}%
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm font-medium text-muted-foreground">Year High</p>
                                        <h3 className="text-2xl font-bold mt-2">{formatPrice(stats.max)}</h3>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm font-medium text-muted-foreground">Year Low</p>
                                        <h3 className="text-2xl font-bold mt-2">{formatPrice(stats.min)}</h3>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-sm font-medium text-muted-foreground">Average</p>
                                        <h3 className="text-2xl font-bold mt-2">{formatPrice(stats.avg)}</h3>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : null}

                        {/* Chart Area */}
                        {historicalLoading ? (
                            <Skeleton className="h-[500px] w-full rounded-xl" />
                        ) : historicalData?.data ? (
                            <PriceChart
                                historicalData={historicalData.data}
                                frequency={frequency}
                                commodity={selectedCommodity}
                            />
                        ) : null}

                        {/* Table Area */}
                        {!historicalLoading && historicalData?.data && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Recent Historical Records</CardTitle>
                                    <CardDescription>Comprehensive list of recorded monthly prices.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Price</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {historicalData.data.slice(-12).reverse().map((item, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell className="font-medium">{formatDate(item.date)}</TableCell>
                                                        <TableCell>{formatPrice(item.price)}</TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                                Actual
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
                    </TabsContent>

                    <TabsContent value="entry" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-primary" />
                                    Bulk Price Entry for {selectedCommodity}
                                </CardTitle>
                                <CardDescription>
                                    Enter actual market prices for each month of the selected year.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleBulkSubmit} className="space-y-8">
                                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold">Target Year</label>
                                            <Input
                                                type="number"
                                                value={bulkYear}
                                                onChange={(e) => setBulkYear(parseInt(e.target.value))}
                                                className="w-32"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <p className="text-xs text-muted-foreground">
                                                <Info className="h-3 w-3 inline mr-1" />
                                                Tip: You can fill as many months as you have data for. Empty fields will be skipped.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs"
                                                    onClick={handleDownloadTemplate}
                                                >
                                                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                                                    Download Excel Template
                                                </Button>
                                                <div className="relative">
                                                    <Input
                                                        type="file"
                                                        accept=".xlsx"
                                                        className="hidden"
                                                        id="excel-upload"
                                                        onChange={handleFileUpload}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => document.getElementById('excel-upload')?.click()}
                                                    >
                                                        <Upload className="h-3 w-3 mr-1" />
                                                        Upload Excel
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {months.map((month, index) => (
                                            <div key={month} className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    {month}
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</div>
                                                    <Input
                                                        placeholder="0.00"
                                                        className="pl-7"
                                                        value={bulkPrices[index] || ""}
                                                        onChange={(e) => handlePriceChange(index, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {submitError && (
                                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3 text-destructive">
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            <p className="text-sm font-medium">{submitError}</p>
                                        </div>
                                    )}

                                    {submitSuccess && (
                                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex gap-3 text-green-600 dark:text-green-400">
                                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                                            <p className="text-sm font-medium">Prices successfully submitted for {bulkYear}!</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || Object.keys(bulkPrices).length === 0}
                                            className="px-8"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                "Submit Yearly Prices"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </motion.div>
    );
}

