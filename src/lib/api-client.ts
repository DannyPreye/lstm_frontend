"use client";

import axios, { AxiosError } from "axios";
import { getSession } from "next-auth/react";
import type {
  CommodityListResponse,
  ForecastPricesResponse,
  HistoricalPricesResponse,
  ErrorResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_KEY || "https://lstm.fly.dev";

// Create axios instance for client-side
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get token from session
async function getAuthToken(): Promise<string | null> {
  try {
    const session = await getSession();
    // Try both possible locations for the token
    return (session as any)?.accessToken || (session?.user as any)?.accessToken || null;
  } catch {
    return null;
  }
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Client-side API Service Functions
export const clientApi = {
  async getCommodities(): Promise<CommodityListResponse> {
    const token = await getAuthToken();
    const response = await apiClient.get<CommodityListResponse>(
      "/api/commodities/",
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async getForecast(params: {
    commodity: string;
    frequency?: "monthly" | "daily";
    horizon?: number;
  }): Promise<ForecastPricesResponse> {
    const token = await getAuthToken();
    const response = await apiClient.get<ForecastPricesResponse>(
      "/api/forecast/",
      {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },

  async getHistorical(params: {
    commodity: string;
    frequency?: "monthly" | "daily";
  }): Promise<HistoricalPricesResponse> {
    const token = await getAuthToken();
    const response = await apiClient.get<HistoricalPricesResponse>(
      "/api/historical/",
      {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  },
};

export default apiClient;
