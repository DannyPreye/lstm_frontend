/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterRequest = {
    /**
     * Required. 3-150 characters. Letters, digits and @/./+/-/_ only.
     */
    username: string;
    /**
     * Required. A valid email address.
     */
    email: string;
    /**
     * Required. Minimum 8 characters.
     */
    password: string;
    /**
     * Required. Must match the password field.
     */
    password_confirmation: string;
};

