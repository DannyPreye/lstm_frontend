"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { PricesService } from "@/lib/api/services/PricesService";
import { OpenAPI } from "@/lib/api/core/OpenAPI";
import type { ActualPriceRequest } from "@/lib/api/models/ActualPriceRequest";

export function useBulkPrices()
{
    const { data: session } = useSession();
    const [ isLoading, setIsLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [ success, setSuccess ] = useState(false);

    const submitBulkPrices = async (commodity: string, year: number, prices: Record<number, string>) =>
    {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        if (!session || !(session as any).accessToken) {
            setError("Authentication required");
            setIsLoading(false);
            return false;
        }

        OpenAPI.TOKEN = (session as any).accessToken;

        try {
            const requests = Object.entries(prices)
                .filter(([ _, price ]) => price && price.trim() !== "")
                .map(([ month, price ]) =>
                {
                    const monthStr = (parseInt(month) + 1).toString().padStart(2, "0");
                    const date = `${year}-${monthStr}-01`;
                    const requestBody: ActualPriceRequest = {
                        commodity,
                        date,
                        price,
                    };
                    return PricesService.pricesSubmitCreate(requestBody);
                });

            if (requests.length === 0) {
                setError("No prices entered to submit");
                setIsLoading(false);
                return false;
            }

            await Promise.all(requests);
            setSuccess(true);
            return true;
        } catch (err: any) {
            console.error("Bulk price submission error:", err);
            setError(err.message || "Failed to submit prices. Please try again.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        submitBulkPrices,
        isLoading,
        error,
        success,
        setSuccess,
        setError
    };
}
