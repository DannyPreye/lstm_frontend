"use client";

import { motion } from "framer-motion";
import {
    LineChart,
    Line,
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type { PriceData } from "@/lib/api/models/PriceData";
import { formatDateForChart, formatDateForTooltip } from "@/lib/utils/date-formatter";
import { formatPriceForTooltip } from "@/lib/utils/price-formatter";
import { getChartColor } from "@/lib/utils/chart-colors";
import { cn } from "@/lib/utils";

interface PriceChartProps {
    historicalData?: PriceData[];
    forecastData?: PriceData[];
    frequency: "monthly" | "daily";
    commodity: string;
    className?: string;
}

interface ChartDataPoint {
    date: string;
    historical: number | null;
    forecast: number | null;
    displayDate: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-border bg-card p-4 shadow-xl backdrop-blur-sm">
                <p className="font-semibold text-foreground mb-3 text-base">
                    {formatDateForTooltip(label)}
                </p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => {
                        if (entry.value === null || entry.value === undefined) return null;
                        const name = entry.name === "historical" ? "Historical" : "Forecast";
                        return (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm font-medium text-muted-foreground">
                                    {name}:
                                </span>
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: entry.color }}
                                >
                                    {formatPriceForTooltip(entry.value)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

export function PriceChart({
    historicalData = [],
    forecastData = [],
    frequency,
    commodity,
    className = "",
}: PriceChartProps) {
    // Validate and normalize input data
    // Historical data uses 'price', forecast data uses 'predicted_price'
    const validHistoricalData = Array.isArray(historicalData)
        ? historicalData.filter(item => {
            if (!item || !item.date) return false;
            const price = (item as any).price ?? (item as any).predicted_price;
            return typeof price === 'number';
        })
        : [];

    const validForecastData = Array.isArray(forecastData)
        ? forecastData.filter(item => {
            if (!item || !item.date) return false;
            const price = (item as any).predicted_price ?? (item as any).price;
            return typeof price === 'number';
        })
        : [];

    // Combine and transform data for chart
    const chartData: ChartDataPoint[] = [];
    const dateMap = new Map<string, ChartDataPoint>();

    // Add historical data
    validHistoricalData.forEach((item) => {
        try {
            // Normalize date to YYYY-MM-DD format for consistent mapping
            const normalizedDate = item.date.includes("T")
                ? item.date.split("T")[0]
                : item.date;
            const displayDate = formatDateForChart(item.date, frequency);
            // Historical data uses 'price' field
            const price = (item as any).price ?? (item as any).predicted_price;
            dateMap.set(normalizedDate, {
                date: normalizedDate,
                historical: price,
                forecast: null,
                displayDate,
            });
        } catch (error) {
            console.error("Error processing historical data point:", error, item);
        }
    });

    // Add forecast data
    validForecastData.forEach((item) => {
        try {
            // Normalize date to YYYY-MM-DD format for consistent mapping
            const normalizedDate = item.date.includes("T")
                ? item.date.split("T")[0]
                : item.date;
            const displayDate = formatDateForChart(item.date, frequency);
            // Forecast data uses 'predicted_price' field
            const price = (item as any).predicted_price ?? (item as any).price;
            const existing = dateMap.get(normalizedDate);
            if (existing) {
                existing.forecast = price;
            } else {
                dateMap.set(normalizedDate, {
                    date: normalizedDate,
                    historical: null,
                    forecast: price,
                    displayDate,
                });
            }
        } catch (error) {
            console.error("Error processing forecast data point:", error, item);
        }
    });

    // Convert map to array and sort by date
    chartData.push(...Array.from(dateMap.values()));
    chartData.sort((a, b) => {
        try {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        } catch (error) {
            return 0;
        }
    });

    const hasHistorical = validHistoricalData.length > 0;
    const hasForecast = validForecastData.length > 0;

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                    <p className="font-medium">No data available</p>
                    <p className="text-sm mt-1">Please select a commodity to view data</p>
                </div>
            </div>
        );
    }

    const historicalColor = getChartColor(1);
    const forecastColor = getChartColor(2);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn("w-full bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 shadow-sm", className)}
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <div className="w-2 h-6 bg-primary rounded-full" />
                        {commodity} Price Analysis
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        Viewing {frequency === "monthly" ? "monthly" : "daily"} price trends
                        {hasHistorical && hasForecast && " and predictive forecasts"}
                    </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {hasHistorical && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: historicalColor }} />
                            <span>Historical</span>
                        </div>
                    )}
                    {hasForecast && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: forecastColor }} />
                            <span>Forecast</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={historicalColor} stopOpacity={0.2} />
                                <stop offset="100%" stopColor={historicalColor} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={forecastColor} stopOpacity={0.15} />
                                <stop offset="100%" stopColor={forecastColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="hsl(var(--muted-foreground))"
                            vertical={false}
                            opacity={0.1}
                        />
                        <XAxis
                            dataKey="displayDate"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
                            dy={15}
                            interval="preserveStartEnd"
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
                            tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                            dx={-5}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        {hasHistorical && (
                            <Area
                                type="monotone"
                                dataKey="historical"
                                stroke={historicalColor}
                                strokeWidth={3}
                                fill="url(#historicalGradient)"
                                dot={{
                                    r: 4,
                                    fill: historicalColor,
                                    stroke: "hsl(var(--background))",
                                    strokeWidth: 2
                                }}
                                activeDot={{
                                    r: 6,
                                    stroke: "hsl(var(--background))",
                                    strokeWidth: 3,
                                    className: "shadow-lg"
                                }}
                                animationDuration={1500}
                                connectNulls
                            />
                        )}
                        {hasForecast && (
                            <Area
                                type="monotone"
                                dataKey="forecast"
                                stroke={forecastColor}
                                strokeWidth={3}
                                strokeDasharray="6 6"
                                fill="url(#forecastGradient)"
                                dot={{
                                    r: 4,
                                    fill: forecastColor,
                                    stroke: "hsl(var(--background))",
                                    strokeWidth: 2
                                }}
                                activeDot={{
                                    r: 6,
                                    stroke: "hsl(var(--background))",
                                    strokeWidth: 3
                                }}
                                animationDuration={1500}
                                animationBegin={400}
                                connectNulls
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

