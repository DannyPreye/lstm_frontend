"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CommoditySelector } from "@/components/CommoditySelector";
import { FrequencySelector } from "@/components/FrequencySelector";
import { PriceChart } from "@/components/PriceChart";
import { ComparisonChart } from "@/components/ComparisonChart";
import { clientApi } from "@/lib/api-client";
import type {
  ForecastPricesResponse,
  HistoricalPricesResponse,
} from "@/types/api";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [commodities, setCommodities] = useState<string[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [frequency, setFrequency] = useState<"monthly" | "daily">("monthly");
  const [horizon, setHorizon] = useState("12");
  const [forecastData, setForecastData] =
    useState<ForecastPricesResponse | null>(null);
  const [historicalData, setHistoricalData] =
    useState<HistoricalPricesResponse | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load commodities on mount
  useEffect(() => {
    const loadCommodities = async () => {
      try {
        const data = await clientApi.getCommodities();
        setCommodities(data.commodities);
        if (data.commodities.length > 0) {
          setSelectedCommodity(data.commodities[0]);
        }
      } catch (err) {
        setError("Failed to load commodities");
      }
    };
    loadCommodities();
  }, []);

  const handleLoadForecast = async () => {
    if (!selectedCommodity) return;

    setIsLoadingForecast(true);
    setError(null);
    try {
      const data = await clientApi.getForecast({
        commodity: selectedCommodity,
        frequency,
        horizon: parseInt(horizon) || undefined,
      });
      setForecastData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load forecast");
    } finally {
      setIsLoadingForecast(false);
    }
  };

  const handleLoadHistorical = async () => {
    if (!selectedCommodity) return;

    setIsLoadingHistorical(true);
    setError(null);
    try {
      const data = await clientApi.getHistorical({
        commodity: selectedCommodity,
        frequency,
      });
      setHistoricalData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to load historical data");
    } finally {
      setIsLoadingHistorical(false);
    }
  };

  // Auto-load historical data when commodity or frequency changes
  useEffect(() => {
    if (selectedCommodity) {
      const loadHistorical = async () => {
        setIsLoadingHistorical(true);
        setError(null);
        try {
          const data = await clientApi.getHistorical({
            commodity: selectedCommodity,
            frequency,
          });
          setHistoricalData(data);
        } catch (err: any) {
          setError(
            err.response?.data?.detail || "Failed to load historical data"
          );
        } finally {
          setIsLoadingHistorical(false);
        }
      };
      loadHistorical();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCommodity, frequency]);

  const comparisonSeries = [];
  if (historicalData) {
    comparisonSeries.push({
      name: "Historical",
      data: historicalData.data,
      color: "#22c55e",
    });
  }
  if (forecastData) {
    comparisonSeries.push({
      name: "Forecast",
      data: forecastData.data,
      color: "#16a34a",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          View forecasts and historical data for commodities
        </p>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <CommoditySelector
              commodities={commodities}
              value={selectedCommodity}
              onValueChange={setSelectedCommodity}
            />
            <FrequencySelector
              value={frequency}
              onValueChange={setFrequency}
            />
            <div className="space-y-2">
              <Label htmlFor="horizon">Forecast Horizon</Label>
              <Input
                id="horizon"
                type="number"
                min="1"
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                placeholder={frequency === "monthly" ? "12" : "180"}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleLoadForecast}
                disabled={!selectedCommodity || isLoadingForecast}
                className="w-full"
              >
                {isLoadingForecast ? "Loading..." : "Load Forecast"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="forecast" className="w-full">
        <TabsList>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="mt-6">
          {isLoadingForecast ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-64 items-center justify-center">
                  <div className="text-muted-foreground">Loading forecast...</div>
                </div>
              </CardContent>
            </Card>
          ) : forecastData ? (
            <PriceChart
              data={forecastData.data}
              title={`${forecastData.commodity} Forecast (${forecastData.frequency})`}
              color="#22c55e"
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  Click "Load Forecast" to view forecast data
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="historical" className="mt-6">
          {isLoadingHistorical ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-64 items-center justify-center">
                  <div className="text-muted-foreground">
                    Loading historical data...
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : historicalData ? (
            <PriceChart
              data={historicalData.data}
              title={`${historicalData.commodity} Historical (${historicalData.frequency})`}
              color="#16a34a"
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  Historical data will load automatically
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          {comparisonSeries.length > 0 ? (
            <ComparisonChart
              series={comparisonSeries}
              title={`${selectedCommodity} - Historical vs Forecast`}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  Load both historical and forecast data to see comparison
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
