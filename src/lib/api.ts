import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type {
  AuthToken,
  AuthTokenRequest,
  TokenRefresh,
  TokenRefreshRequest,
  TokenVerifyRequest,
  CommodityListResponse,
  ForecastPricesResponse,
  HistoricalPricesResponse,
  ErrorResponse,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_KEY || "https://lstm.fly.dev";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (client-side) or from session (server-side)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post<TokenRefresh>(
            `${API_BASE_URL}/api/auth/token/refresh/`,
            { refresh: refreshToken }
          );

          const { access, refresh } = response.data;
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Service Functions
export const api = {
  // Auth endpoints
  async authToken(data: AuthTokenRequest): Promise<AuthToken> {
    const response = await apiClient.post<AuthToken>(
      "/api/auth/token/",
      data
    );
    return response.data;
  },

  async refreshToken(data: TokenRefreshRequest): Promise<TokenRefresh> {
    const response = await apiClient.post<TokenRefresh>(
      "/api/auth/token/refresh/",
      data
    );
    return response.data;
  },

  async verifyToken(data: TokenVerifyRequest): Promise<void> {
    await apiClient.post("/api/auth/token/verify/", data);
  },

  // Commodities endpoint
  async getCommodities(): Promise<CommodityListResponse> {
    const response = await apiClient.get<CommodityListResponse>(
      "/api/commodities/"
    );
    return response.data;
  },

  // Forecast endpoint
  async getForecast(params: {
    commodity: string;
    frequency?: "monthly" | "daily";
    horizon?: number;
  }): Promise<ForecastPricesResponse> {
    const response = await apiClient.get<ForecastPricesResponse>(
      "/api/forecast/",
      { params }
    );
    return response.data;
  },

  // Historical endpoint
  async getHistorical(params: {
    commodity: string;
    frequency?: "monthly" | "daily";
  }): Promise<HistoricalPricesResponse> {
    const response = await apiClient.get<HistoricalPricesResponse>(
      "/api/historical/",
      { params }
    );
    return response.data;
  },
};

export default apiClient;





