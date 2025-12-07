/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommodityListResponse } from '../models/CommodityListResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CommoditiesService {
    /**
     * Get available commodities
     * Returns a list of all available commodities for forecasting
     * @returns CommodityListResponse
     * @throws ApiError
     */
    public static commoditiesRetrieve(): CancelablePromise<CommodityListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/commodities/',
        });
    }
}
