"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
    ArrowLeft,
    Download,
    TrendingUp,
    Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils/date-formatter";
import { formatPrice } from "@/lib/utils/price-formatter";

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

export default function HistoricalViewerPage() {
    const router = useRouter();
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
                    className='flex items-center justify-between'
                >
                    <div className='flex items-center gap-4'>
                        <Button
                            variant='outline'
                            onClick={() => router.push("/dashboard")}
                            className='shadow-sm'
                        >
                            <ArrowLeft className='h-4 w-4 mr-2' />
                            Back to Dashboard
                        </Button>
                        <div>
                            <h1 className='text-3xl font-bold text-foreground'>
                                Historical Viewer
                            </h1>
                            <p className='text-muted-foreground mt-1'>
                                Explore historical price data for commodities
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Controls */}
                <motion.div variants={itemVariants}>
                    <Card className='shadow-lg border-border/50'>
                        <CardHeader className='pb-4'>
                            <CardTitle className='text-xl'>
                                Select Parameters
                            </CardTitle>
                            <CardDescription>
                                Choose a commodity to view historical price data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='space-y-2'>
                                <label className='text-sm font-semibold text-foreground'>
                                    Commodity
                                </label>
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
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Chart */}
                {selectedCommodity && (
                    <motion.div>
                        <Card className='shadow-lg border-border/50'>
                            <CardHeader className='flex flex-row items-center justify-between pb-4'>
                                <div>
                                    <CardTitle className='text-xl flex items-center gap-2'>
                                        <TrendingUp className='h-5 w-5 text-primary' />
                                        {selectedCommodity} - Historical Prices
                                    </CardTitle>
                                    <CardDescription className='flex items-center gap-2 mt-1'>
                                        <Calendar className='h-4 w-4' />
                                        Monthly frequency
                                        {historicalData?.data &&
                                            ` • ${historicalData.data.length} data points`}
                                    </CardDescription>
                                </div>
                                {historicalData?.data &&
                                    Array.isArray(historicalData.data) &&
                                    historicalData.data.length > 0 && (
                                        <Button
                                            variant='outline'
                                            onClick={handleExportCSV}
                                            className='shadow-sm'
                                        >
                                            <Download className='h-4 w-4 mr-2' />
                                            Export CSV
                                        </Button>
                                    )}
                            </CardHeader>
                            <CardContent>
                                {historicalLoading ? (
                                    <div className='space-y-4'>
                                        <Skeleton className='h-[450px] w-full' />
                                        <div className='space-y-2'>
                                            <Skeleton className='h-10 w-full' />
                                            <Skeleton className='h-10 w-full' />
                                            <Skeleton className='h-10 w-full' />
                                        </div>
                                    </div>
                                ) : historicalError ? (
                                    <div className='flex flex-col items-center justify-center h-64 text-destructive space-y-3'>
                                        <div className='rounded-full bg-destructive/10 p-3'>
                                            <Loader2 className='h-6 w-6' />
                                        </div>
                                        <p className='font-semibold text-lg'>
                                            Error loading historical data
                                        </p>
                                        <p className='text-sm text-muted-foreground text-center max-w-md'>
                                            {historicalError instanceof Error
                                                ? historicalError.message
                                                : "Please try again or select a different commodity"}
                                        </p>
                                    </div>
                                ) : historicalData?.data &&
                                  Array.isArray(historicalData.data) &&
                                  historicalData.data.length > 0 ? (
                                    <>
                                        <PriceChart
                                            historicalData={historicalData.data}
                                            frequency={frequency}
                                            commodity={selectedCommodity}
                                        />
                                        {/* Data Table */}
                                        <div className='mt-8'>
                                            <h3 className='text-lg font-semibold mb-4 text-foreground'>
                                                Data Table
                                            </h3>
                                            <div className='rounded-lg border border-border overflow-hidden'>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className='bg-muted/50'>
                                                            <TableHead className='font-semibold'>
                                                                Date
                                                            </TableHead>
                                                            <TableHead className='text-right font-semibold'>
                                                                Price
                                                            </TableHead>
                                                            {(
                                                                historicalData
                                                                    .data[0] as any
                                                            )?.season_flag !==
                                                                undefined && (
                                                                <TableHead className='text-center font-semibold'>
                                                                    Season
                                                                </TableHead>
                                                            )}
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {historicalData.data.map(
                                                            (item, index) => {
                                                                const seasonFlag =
                                                                    (
                                                                        item as any
                                                                    )
                                                                        .season_flag;
                                                                const isPeakSeason =
                                                                    seasonFlag ===
                                                                    1;
                                                                return (
                                                                    <TableRow
                                                                        key={
                                                                            index
                                                                        }
                                                                        className='hover:bg-muted/30 transition-colors'
                                                                    >
                                                                        <TableCell className='font-medium'>
                                                                            {formatDate(
                                                                                item.date
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className='text-right font-semibold text-primary'>
                                                                            {formatPrice(
                                                                                item.price
                                                                            )}
                                                                        </TableCell>
                                                                        {seasonFlag !==
                                                                            undefined && (
                                                                            <TableCell className='text-center'>
                                                                                <span
                                                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                                        isPeakSeason
                                                                                            ? "bg-primary/20 text-primary"
                                                                                            : "bg-muted text-muted-foreground"
                                                                                    }`}
                                                                                >
                                                                                    {isPeakSeason
                                                                                        ? "Peak"
                                                                                        : "Off"}
                                                                                </span>
                                                                            </TableCell>
                                                                        )}
                                                                    </TableRow>
                                                                );
                                                            }
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </>
                                ) : historicalData?.data &&
                                  Array.isArray(historicalData.data) &&
                                  historicalData.data.length === 0 ? (
                                    <div className='flex flex-col items-center justify-center h-64 text-muted-foreground space-y-3'>
                                        <div className='rounded-full bg-muted p-4'>
                                            <TrendingUp className='h-8 w-8' />
                                        </div>
                                        <p className='font-medium'>
                                            No historical data available
                                        </p>
                                        <p className='text-sm text-center'>
                                            No data found for{" "}
                                            {selectedCommodity} with monthly
                                            frequency
                                        </p>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {!selectedCommodity && (
                    <motion.div variants={itemVariants}>
                        <Card className='shadow-lg border-border/50'>
                            <CardContent className='py-16 text-center'>
                                <div className='flex flex-col items-center space-y-4'>
                                    <div className='rounded-full bg-muted p-6'>
                                        <TrendingUp className='h-12 w-12 text-muted-foreground' />
                                    </div>
                                    <div>
                                        <p className='text-lg font-semibold text-foreground mb-2'>
                                            Select a Commodity
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                            Choose a commodity from the dropdown
                                            above to view historical price data
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
