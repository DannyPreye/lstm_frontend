/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HistoricalPricesResponse } from '../models/HistoricalPricesResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HistoricalService {
    /**
     * Get historical prices
     * Get historical price data for a commodity with specified frequency
     * @param commodity
     * @param frequency * `monthly` - monthly
     * * `daily` - daily
     * @returns HistoricalPricesResponse
     * @throws ApiError
     */
    public static historicalRetrieve(
        commodity: string,
        frequency: 'monthly' | 'daily' = 'monthly',
    ): CancelablePromise<HistoricalPricesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/historical/',
            query: {
                'commodity': commodity,
                'frequency': frequency,
            },
        });
    }
}
