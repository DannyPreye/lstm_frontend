/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Response serializer for price submissions.
 */
export type ActualPriceResponse = {
    readonly id: number;
    readonly commodity: string;
    readonly date: string;
    readonly price: string;
    message?: string;
    /**
     * Whether model will be retrained with this data
     */
    will_retrain?: boolean;
};

