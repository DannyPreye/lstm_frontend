import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthSessionProvider } from "@/providers/session-provider";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "LSTM Commodity Price Forecasting",
    description: "Forecast commodity prices using LSTM models",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={inter.className}>
                <QueryProvider>
                    <AuthSessionProvider>{children}</AuthSessionProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
