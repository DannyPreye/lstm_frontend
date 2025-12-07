"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ForecastService } from "@/lib/api/services/ForecastService";
import { OpenAPI } from "@/lib/api/core/OpenAPI";
import type { ForecastPricesResponse } from "@/lib/api/models/ForecastPricesResponse";

export function useForecast(
    commodity: string | null,
    frequency: "monthly" | "daily" = "monthly",
    horizon?: number,
    enabled: boolean = false
)
{
    const { data: session } = useSession();

    return useQuery<ForecastPricesResponse, Error>({
        queryKey: [ "forecast", commodity, frequency, horizon ],
        queryFn: async () =>
        {
            if (!commodity) {
                throw new Error("Commodity is required");
            }

            // Set token inside queryFn to ensure it's set before API call
            if (session && (session as any).accessToken) {
                OpenAPI.TOKEN = (session as any).accessToken;
            } else {
                throw new Error("Authentication required");
            }

            try {
                const response = await ForecastService.forecastRetrieve(commodity, frequency, horizon);
                console.log("response", response);
                return response;
            } catch (error: any) {
                console.error("Forecast data fetch error:", error);
                throw error;
            }
        },
        enabled: enabled && !!commodity && !!session && !!(session as any)?.accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

