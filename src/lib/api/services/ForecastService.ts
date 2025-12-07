/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ForecastPricesResponse } from '../models/ForecastPricesResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ForecastService {
    /**
     * Get price forecasts
     * Get LSTM-based price forecasts for a commodity. Default horizon: 12 periods for monthly, 180 for daily.
     * @param commodity
     * @param frequency * `monthly` - monthly
     * * `daily` - daily
     * @param horizon
     * @returns ForecastPricesResponse
     * @throws ApiError
     */
    public static forecastRetrieve(
        commodity: string,
        frequency: 'monthly' | 'daily' = 'monthly',
        horizon?: number,
    ): CancelablePromise<ForecastPricesResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/forecast/',
            query: {
                'commodity': commodity,
                'frequency': frequency,
                'horizon': horizon,
            },
        });
    }
}
