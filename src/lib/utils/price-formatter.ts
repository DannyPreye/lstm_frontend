/**
 * Format price number to currency string
 */
export function formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

/**
 * Format price for display without currency symbol
 */
export function formatPriceNumber(price: number): string {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
}

/**
 * Format price for chart tooltip
 */
export function formatPriceForTooltip(price: number): string {
    return formatPrice(price);
}

