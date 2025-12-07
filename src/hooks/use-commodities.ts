"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { CommoditiesService } from "@/lib/api/services/CommoditiesService";
import { OpenAPI } from "@/lib/api/core/OpenAPI";
import type { CommodityListResponse } from "@/lib/api/models/CommodityListResponse";

export function useCommodities() {
    const { data: session } = useSession();

    return useQuery<CommodityListResponse, Error>({
        queryKey: ["commodities"],
        queryFn: async () => {
            // Set token inside queryFn to ensure it's set before API call
            if (session && (session as any).accessToken) {
                OpenAPI.TOKEN = (session as any).accessToken;
            } else {
                throw new Error("Authentication required");
            }

            try {
                const response = await CommoditiesService.commoditiesRetrieve();
                return response;
            } catch (error: any) {
                console.error("Commodities fetch error:", error);
                throw error;
            }
        },
        staleTime: 10 * 60 * 1000, // 10 minutes - commodities don't change often
        enabled: !!session && !!(session as any)?.accessToken,
    });
}

