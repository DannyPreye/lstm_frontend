/**
 * Parse date string (handles both YYYY-MM-DD and ISO 8601 formats)
 */
function parseDate(dateString: string): Date {
    // Handle ISO 8601 format (2021-01-01T00:00:00) or YYYY-MM-DD format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateString}`);
    }
    return date;
}

/**
 * Format date string (YYYY-MM-DD or ISO 8601) to display format
 */
export function formatDate(dateString: string): string {
    try {
        const date = parseDate(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch (error) {
        return dateString; // Return original if parsing fails
    }
}

/**
 * Format date for chart axis (monthly view)
 */
export function formatDateForChart(dateString: string, frequency: "monthly" | "daily"): string {
    try {
        const date = parseDate(dateString);

        if (frequency === "monthly") {
            return date.toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
            });
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    } catch (error) {
        // Extract just the date part if full ISO string
        const datePart = dateString.split("T")[0];
        return datePart || dateString;
    }
}

/**
 * Format date for tooltip
 */
export function formatDateForTooltip(dateString: string): string {
    try {
        const date = parseDate(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch (error) {
        // Extract just the date part if full ISO string
        const datePart = dateString.split("T")[0];
        return datePart || dateString;
    }
}

/**
 * Extract date part from ISO 8601 string (YYYY-MM-DD)
 */
export function extractDatePart(dateString: string): string {
    // Handle ISO 8601 format by extracting just the date part
    if (dateString.includes("T")) {
        return dateString.split("T")[0];
    }
    return dateString;
}

