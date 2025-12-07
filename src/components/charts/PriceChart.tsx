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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn("w-full", className)}
        >
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                    {commodity} Price Trend
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {frequency === "monthly" ? "Monthly" : "Daily"} data
                    {hasHistorical && hasForecast && " with forecast"}
                </p>
            </div>
            <ResponsiveContainer width="100%" height={450}>
                <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                    <defs>
                        {hasHistorical && (
                            <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={historicalColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={historicalColor} stopOpacity={0} />
                            </linearGradient>
                        )}
                        {hasForecast && (
                            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={forecastColor} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={forecastColor} stopOpacity={0} />
                            </linearGradient>
                        )}
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                    />
                    <XAxis
                        dataKey="displayDate"
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: "11px", fontWeight: 500 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: "11px", fontWeight: 500 }}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        iconType="line"
                        formatter={(value) => {
                            if (value === "historical") return "Historical";
                            if (value === "forecast") return "Forecast";
                            return value;
                        }}
                        style={{ fontSize: "12px", fontWeight: 500 }}
                    />
                    {hasHistorical && (
                        <>
                            <Area
                                type="monotone"
                                dataKey="historical"
                                stroke="none"
                                fill="url(#historicalGradient)"
                                fillOpacity={1}
                            />
                            <Line
                                type="monotone"
                                dataKey="historical"
                                stroke={historicalColor}
                                strokeWidth={3}
                                dot={{ r: 4, fill: historicalColor, strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                                name="historical"
                                connectNulls={false}
                                animationDuration={1000}
                            />
                        </>
                    )}
                    {hasForecast && (
                        <Line
                            type="monotone"
                            dataKey="forecast"
                            stroke={forecastColor}
                            strokeWidth={3}
                            strokeDasharray="8 4"
                            dot={{ r: 4, fill: forecastColor, strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                            name="forecast"
                            connectNulls={false}
                            animationDuration={1000}
                            animationBegin={hasHistorical ? 200 : 0}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

