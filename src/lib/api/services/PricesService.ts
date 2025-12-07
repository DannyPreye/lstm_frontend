/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActualPriceRequest } from '../models/ActualPriceRequest';
import type { ActualPriceResponse } from '../models/ActualPriceResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PricesService {
    /**
     * Submit actual market price
     * Submit actual market price data for a specific month. The model will use this for continuous learning and improved predictions. Date should be the first day of the month (e.g., 2026-01-01 for January 2026).
     * @param requestBody
     * @returns ActualPriceResponse
     * @throws ApiError
     */
    public static pricesSubmitCreate(
        requestBody: ActualPriceRequest,
    ): CancelablePromise<ActualPriceResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/prices/submit/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
