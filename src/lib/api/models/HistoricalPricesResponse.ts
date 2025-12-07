/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PriceData } from './PriceData';
export type HistoricalPricesResponse = {
    /**
     * Commodity name
     */
    commodity: string;
    /**
     * Data frequency (monthly or daily)
     */
    frequency: string;
    /**
     * List of historical price data points
     */
    data: Array<PriceData>;
};

