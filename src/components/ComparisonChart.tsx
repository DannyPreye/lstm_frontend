"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PriceData } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComparisonSeries {
  name: string;
  data: PriceData[];
  color: string;
}

interface ComparisonChartProps {
  series: ComparisonSeries[];
  title?: string;
}

export function ComparisonChart({
  series,
  title = "Comparison Chart",
}: ComparisonChartProps) {
  if (!series || series.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine all series data by date
  const dateMap = new Map<string, Record<string, number>>();

  series.forEach((s) => {
    s.data.forEach((item) => {
      if (!dateMap.has(item.date)) {
        dateMap.set(item.date, {});
      }
      dateMap.get(item.date)![s.name] = item.price;
    });
  });

  const chartData = Array.from(dateMap.entries())
    .map(([date, prices]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: dateMap.size > 12 ? "numeric" : undefined,
      }),
      fullDate: date,
      ...prices,
    }))
    .sort(
      (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    );

  const colors = [
    "#22c55e", // green
    "#16a34a", // darker green
    "#15803d", // darkest green
    "#84cc16", // lime green
    "#65a30d", // olive green
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              angle={chartData.length > 12 ? -45 : 0}
              textAnchor={chartData.length > 12 ? "end" : "middle"}
              height={chartData.length > 12 ? 80 : 30}
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            {series.map((s, index) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={s.color || colors[index % colors.length]}
                strokeWidth={2}
                dot={{ fill: s.color || colors[index % colors.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}





