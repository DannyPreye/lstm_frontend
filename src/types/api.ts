// API Types based on OpenAPI spec

export interface AuthToken {
  token: string;
}

export interface AuthTokenRequest {
  username: string;
  password: string;
}

export interface TokenRefresh {
  access: string;
  refresh: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenVerifyRequest {
  token: string;
}

export interface CommodityListResponse {
  commodities: string[];
}

export interface PriceData {
  date: string; // YYYY-MM-DD format
  price: number;
}

export interface ForecastPricesResponse {
  commodity: string;
  frequency: "monthly" | "daily";
  horizon: number;
  data: PriceData[];
}

export interface HistoricalPricesResponse {
  commodity: string;
  frequency: "monthly" | "daily";
  data: PriceData[];
}

export interface ErrorResponse {
  detail: string;
}
