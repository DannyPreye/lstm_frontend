/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PriceData } from './PriceData';
export type ForecastPricesResponse = {
    /**
     * Commodity name
     */
    commodity: string;
    /**
     * Forecast frequency (monthly or daily)
     */
    frequency: string;
    /**
     * Number of periods forecasted
     */
    horizon: number;
    /**
     * List of forecasted price data points
     */
    data: Array<PriceData>;
};

