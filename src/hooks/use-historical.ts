"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { HistoricalService } from "@/lib/api/services/HistoricalService";
import { OpenAPI } from "@/lib/api/core/OpenAPI";
import type { HistoricalPricesResponse } from "@/lib/api/models/HistoricalPricesResponse";

export function useHistorical(
    commodity: string | null,
    frequency: "monthly" | "daily" = "monthly",
    enabled: boolean = true
) {
    const { data: session } = useSession();

    return useQuery<HistoricalPricesResponse, Error>({
        queryKey: ["historical", commodity, frequency],
        queryFn: async () => {
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
                const response = await HistoricalService.historicalRetrieve(commodity, frequency);
                return response;
            } catch (error: any) {
                console.error("Historical data fetch error:", error);
                throw error;
            }
        },
        enabled: enabled && !!commodity && !!session && !!(session as any)?.accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

