"use client";

import { getSession } from "next-auth/react";
import { OpenAPI } from "./core/OpenAPI";

// Configure OpenAPI to use token from session
export async function configureApiToken() {
    try {
        const session = await getSession();
        const token = (session as any)?.accessToken;
        if (token) {
            OpenAPI.TOKEN = token;
        }
    } catch (error) {
        console.error("Failed to configure API token:", error);
    }
}

// Initialize token configuration
if (typeof window !== "undefined") {
    configureApiToken();
}

