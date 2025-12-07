/**
 * Get chart colors from CSS variables
 * These functions return the computed color values for use in Recharts
 */

export function getChartColor(index: 1 | 2 | 3 | 4 | 5): string {
    if (typeof window === "undefined") {
        // Default colors for SSR (light mode defaults) - Agriculture greens
        const defaults = {
            1: "oklch(0.55 0.15 145)", // Forest green
            2: "oklch(0.65 0.18 150)", // Emerald green
            3: "oklch(0.45 0.12 160)", // Teal green
            4: "oklch(0.75 0.15 120)", // Lime green
            5: "oklch(0.6 0.2 80)", // Olive/yellow-green
        };
        return defaults[index];
    }

    // Get the computed CSS variable value
    const root = document.documentElement;
    const colorValue = getComputedStyle(root)
        .getPropertyValue(`--chart-${index}`)
        .trim();

    // If the value is already in oklch format, return it
    if (colorValue && colorValue.startsWith("oklch")) {
        return colorValue;
    }

    // Fallback to default - Agriculture greens
    const defaults = {
        1: "oklch(0.55 0.15 145)", // Forest green
        2: "oklch(0.65 0.18 150)", // Emerald green
        3: "oklch(0.45 0.12 160)", // Teal green
        4: "oklch(0.75 0.15 120)", // Lime green
        5: "oklch(0.6 0.2 80)", // Olive/yellow-green
    };
    return defaults[index];
}

