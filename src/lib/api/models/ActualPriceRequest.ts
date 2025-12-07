/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for submitting actual market prices.
 */
export type ActualPriceRequest = {
    /**
     * Commodity name (e.g., 'Cocoa Beans')
     */
    commodity: string;
    /**
     * Date of the actual price (format: YYYY-MM-DD). Should be the first day of the month for monthly prices.
     */
    date: string;
    /**
     * Actual market price
     */
    price: string;
    /**
     * Optional notes about the price
     */
    notes?: string;
};

