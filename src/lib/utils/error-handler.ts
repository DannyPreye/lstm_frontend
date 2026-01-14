import type { ApiError } from "@/lib/api/core/ApiError";

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        const apiError = error as ApiError;

        // Handle API errors with structured response
        if (apiError.body && typeof apiError.body === "object") {
            const errorMessages: string[] = [];

            Object.entries(apiError.body).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    errorMessages.push(...value.map((v) => String(v)));
                } else if (typeof value === "string") {
                    errorMessages.push(value);
                } else if (typeof value === "object" && value !== null) {
                    // Handle nested error objects
                    Object.values(value).forEach((nestedValue) => {
                        if (Array.isArray(nestedValue)) {
                            errorMessages.push(...nestedValue.map((v) => String(v)));
                        } else if (typeof nestedValue === "string") {
                            errorMessages.push(nestedValue);
                        }
                    });
                }
            });

            if (errorMessages.length > 0) {
                return errorMessages.join(", ");
            }
        }

        // Handle specific status codes
        if (apiError.status === 401) {
            return "Invalid credentials. Please check your username and password.";
        }

        if (apiError.status === 403) {
            return "You don't have permission to perform this action.";
        }

        if (apiError.status === 404) {
            return "The requested resource was not found.";
        }

        if (apiError.status === 500) {
            return "Server error. Please try again later.";
        }

        // Return the error message if available
        if (apiError.message) {
            return apiError.message;
        }
    }

    // Fallback for unknown errors
    return "An unexpected error occurred. Please try again.";
}

export function formatApiError(error: unknown): {
    message: string;
    status?: number;
    fieldErrors?: Record<string, string[]>;
} {
    if (error instanceof Error) {
        const apiError = error as ApiError;
        const fieldErrors: Record<string, string[]> = {};

        // Extract field-specific errors
        if (apiError.body && typeof apiError.body === "object") {
            Object.entries(apiError.body).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    fieldErrors[key] = value.map((v) => String(v));
                } else if (typeof value === "string") {
                    fieldErrors[key] = [value];
                }
            });
        }

        return {
            message: getErrorMessage(error),
            status: apiError.status,
            fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        };
    }

    return {
        message: getErrorMessage(error),
    };
}



