// Type declarations for Next.js modules
// These are fallback declarations in case Next.js types aren't resolved properly

declare module "next" {
    export interface NextConfig {
        [key: string]: any;
    }
    export interface Metadata {
        title?: string | { default: string; template?: string };
        description?: string;
        [key: string]: any;
    }
}

declare module "next/font/google" {
    export function Inter(options?: {
        subsets?: string[];
        weight?: string | string[];
        style?: string | string[];
        variable?: string;
        display?: string;
        preload?: boolean;
        fallback?: string[];
        adjustFontFallback?: boolean;
        [key: string]: any;
    }): {
        className: string;
        style: { fontFamily: string };
        variable?: string;
    };
}

declare module "next/navigation" {
    export function useRouter(): {
        push: (href: string) => void;
        replace: (href: string) => void;
        prefetch: (href: string) => void;
        back: () => void;
        forward: () => void;
        refresh: () => void;
    };
    export function usePathname(): string;
    export function useSearchParams(): URLSearchParams;
}

declare module "next/link" {
    import { ComponentProps } from "react";
    export default function Link(
        props: ComponentProps<"a"> & {
            href: string;
            prefetch?: boolean;
            replace?: boolean;
            scroll?: boolean;
            shallow?: boolean;
        }
    ): JSX.Element;
}

declare module "next/server" {
    export class NextRequest extends Request {
        constructor(input: RequestInfo | URL, init?: RequestInit);
        nextUrl: URL;
        cookies: any;
    }
    export class NextResponse extends Response {
        static next(): NextResponse;
        static redirect(url: string | URL, status?: number): NextResponse;
        static json(body: any, init?: ResponseInit): NextResponse;
        static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
    }
}

declare module "next/server.js" {
    export class NextRequest extends Request {
        constructor(input: RequestInfo | URL, init?: RequestInit);
        nextUrl: URL;
        cookies: any;
    }
    export class NextResponse extends Response {
        static next(): NextResponse;
        static redirect(url: string | URL, status?: number): NextResponse;
        static json(body: any, init?: ResponseInit): NextResponse;
        static rewrite(destination: string | URL, init?: ResponseInit): NextResponse;
    }
}

declare module "next/types.js" {
    export type ResolvingMetadata<T = any> = (
        props: T,
        parent: any
    ) => Promise<any>;
    export type ResolvingViewport<T = any> = (
        props: T,
        parent: any
    ) => Promise<any>;
}

