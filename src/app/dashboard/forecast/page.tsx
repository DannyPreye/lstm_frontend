"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
    ArrowLeft,
    Sparkles,
    TrendingUp,
    Calendar,
    Target,
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

export default function ForecastGeneratorPage() {
    const router = useRouter();
    const [selectedCommodity, setSelectedCommodity] = useState<string>("");
    const frequency: "monthly" = "monthly"; // Always monthly
    const [horizon, setHorizon] = useState<string>("");
    const [shouldGenerate, setShouldGenerate] = useState(false);

    const defaultHorizon = 12; // Monthly default

    const { data: commoditiesData, isLoading: commoditiesLoading } =
        useCommodities();
    const { data: historicalData, isLoading: historicalLoading } =
        useHistorical(
            selectedCommodity || null,
            frequency,
            !!selectedCommodity && shouldGenerate
        );

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
                                Forecast Generator
                            </h1>
                            <p className='text-muted-foreground mt-1'>
                                Generate LSTM-based price forecasts for
                                commodities
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Controls */}
                <motion.div variants={itemVariants}>
                    <Card className='shadow-lg border-border/50'>
                        <CardHeader className='pb-4'>
                            <CardTitle className='text-xl flex items-center gap-2'>
                                <Target className='h-5 w-5 text-primary' />
                                Forecast Parameters
                            </CardTitle>
                            <CardDescription>
                                Configure parameters to generate price forecasts
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='space-y-2'>
                                <Label
                                    htmlFor='commodity'
                                    className='text-sm font-semibold'
                                >
                                    Commodity
                                </Label>
                                {commoditiesLoading ? (
                                    <Skeleton className='h-10 w-full' />
                                ) : (
                                    <Select
                                        id='commodity'
                                        value={selectedCommodity}
                                        onChange={(e) => {
                                            setSelectedCommodity(
                                                e.target.value
                                            );
                                            setShouldGenerate(false);
                                        }}
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

                            <div className='space-y-2'>
                                <Label
                                    htmlFor='horizon'
                                    className='text-sm font-semibold'
                                >
                                    Horizon (number of periods to forecast)
                                </Label>
                                <Input
                                    id='horizon'
                                    type='number'
                                    placeholder={defaultHorizon.toString()}
                                    value={horizon}
                                    onChange={(e) => {
                                        setHorizon(e.target.value);
                                        setShouldGenerate(false);
                                    }}
                                    min='1'
                                />
                                <p className='text-xs text-muted-foreground'>
                                    Leave empty to use default ({defaultHorizon}{" "}
                                    periods)
                                </p>
                            </div>

                            <div className='flex gap-3 pt-2'>
                                <Button
                                    onClick={handleGenerate}
                                    disabled={
                                        !selectedCommodity ||
                                        forecastLoading ||
                                        historicalLoading
                                    }
                                    className='flex items-center gap-2 shadow-sm'
                                    size='lg'
                                >
                                    {forecastLoading || historicalLoading ? (
                                        <>
                                            <Loader2 className='h-4 w-4 animate-spin' />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className='h-4 w-4' />
                                            Generate Forecast
                                        </>
                                    )}
                                </Button>
                                {shouldGenerate && (
                                    <Button
                                        variant='outline'
                                        onClick={handleReset}
                                        className='shadow-sm'
                                        size='lg'
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Results */}
                {shouldGenerate && selectedCommodity && (
                    <motion.div>
                        <Card className='shadow-lg border-border/50'>
                            <CardHeader className='pb-4'>
                                <CardTitle className='text-xl flex items-center gap-2'>
                                    <TrendingUp className='h-5 w-5 text-primary' />
                                    Forecast Results - {selectedCommodity}
                                </CardTitle>
                                <CardDescription className='flex items-center gap-2 mt-1'>
                                    <Calendar className='h-4 w-4' />
                                    Monthly frequency
                                    {forecastData
                                        ? ` • ${forecastData.horizon} periods forecasted`
                                        : " • Generating forecast..."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {forecastLoading || historicalLoading ? (
                                    <div className='space-y-4'>
                                        <Skeleton className='h-[450px] w-full' />
                                        <div className='space-y-2'>
                                            <Skeleton className='h-10 w-full' />
                                            <Skeleton className='h-10 w-full' />
                                            <Skeleton className='h-10 w-full' />
                                        </div>
                                    </div>
                                ) : forecastError ? (
                                    <div className='flex flex-col items-center justify-center h-64 text-destructive space-y-3'>
                                        <div className='rounded-full bg-destructive/10 p-3'>
                                            <Loader2 className='h-6 w-6' />
                                        </div>
                                        <p className='font-semibold text-lg'>
                                            Error generating forecast
                                        </p>
                                        <p className='text-sm text-muted-foreground text-center max-w-md'>
                                            {forecastError instanceof Error
                                                ? forecastError.message
                                                : "Please try again or adjust your parameters"}
                                        </p>
                                    </div>
                                ) : forecastData?.data &&
                                  Array.isArray(forecastData.data) &&
                                  forecastData.data.length > 0 ? (
                                    <>
                                        <PriceChart
                                            historicalData={
                                                historicalData?.data || []
                                            }
                                            forecastData={forecastData.data}
                                            frequency={frequency}
                                            commodity={selectedCommodity}
                                        />
                                        {/* Forecast Data Table */}
                                        <div className='mt-8'>
                                            <h3 className='text-lg font-semibold mb-4 text-foreground'>
                                                Forecast Data
                                            </h3>
                                            <div className='rounded-lg border border-border overflow-hidden'>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className='bg-muted/50'>
                                                            <TableHead className='font-semibold'>
                                                                Date
                                                            </TableHead>
                                                            <TableHead className='text-right font-semibold'>
                                                                Forecasted Price
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {forecastData.data.map(
                                                            (item, index) => {
                                                                // Forecast data uses 'predicted_price' instead of 'price'
                                                                const price =
                                                                    (
                                                                        item as any
                                                                    )
                                                                        .predicted_price ??
                                                                    (
                                                                        item as any
                                                                    ).price;
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
                                                                                price
                                                                            )}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            }
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </>
                                ) : forecastData?.data &&
                                  Array.isArray(forecastData.data) &&
                                  forecastData.data.length === 0 ? (
                                    <div className='flex flex-col items-center justify-center h-64 text-muted-foreground space-y-3'>
                                        <div className='rounded-full bg-muted p-4'>
                                            <Target className='h-8 w-8' />
                                        </div>
                                        <p className='font-medium'>
                                            No forecast data available
                                        </p>
                                        <p className='text-sm text-center'>
                                            Unable to generate forecast for the
                                            selected parameters
                                        </p>
                                    </div>
                                ) : null}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {!shouldGenerate && (
                    <motion.div variants={itemVariants}>
                        <Card className='shadow-lg border-border/50'>
                            <CardContent className='py-16 text-center'>
                                <div className='flex flex-col items-center space-y-4'>
                                    <div className='rounded-full bg-muted p-6'>
                                        <Sparkles className='h-12 w-12 text-muted-foreground' />
                                    </div>
                                    <div>
                                        <p className='text-lg font-semibold text-foreground mb-2'>
                                            Ready to Generate Forecast
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                            Configure parameters above and click
                                            "Generate Forecast" to create
                                            predictions
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
