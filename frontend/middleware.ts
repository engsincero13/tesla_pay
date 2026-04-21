import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Hub URL - users without Keycloak session are redirected here
const HUB_URL = "https://hub.teslatreinamentos.com";

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        // Ensure secret is picked up (NextAuth usually handles this, but good to be explicit if needed)
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // 1. Allow auth paths
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // 2. Allow static assets
    if (
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname === "/logo-tesla-svg.svg" ||
        pathname.endsWith(".svg") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".ico")
    ) {
        return NextResponse.next();
    }

    // 3. Allow unauthorized page to prevent redirect loops
    if (pathname === "/unauthorized") {
        return NextResponse.next();
    }

    // 4. Authentication & SSO Logic
    if (!token) {
        // Check if we just tried SSO and it failed (error from NextAuth callback)
        const hasAuthError = request.nextUrl.searchParams.get("error") === "OAuthCallback" ||
            request.nextUrl.searchParams.get("error") === "AccessDenied" ||
            request.nextUrl.searchParams.get("error") === "Callback";

        // Check if this is a redirect loop prevention (already tried SSO)
        const triedSSO = request.cookies.get("tried_sso")?.value === "true";

        if (hasAuthError || triedSSO) {
            // SSO failed - user not logged into Keycloak, redirect to Hub
            const response = NextResponse.redirect(HUB_URL);
            // Clear the SSO attempt cookie
            response.cookies.delete("tried_sso");
            return response;
        }

        // First attempt: Try SSO with Keycloak
        // If user is logged into Keycloak, they'll be redirected back automatically
        const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
        const callbackUrl = new URL(pathname, baseUrl).toString();
        const signInUrl = new URL("/api/auth/signin/keycloak", baseUrl);
        signInUrl.searchParams.set("callbackUrl", callbackUrl);

        // Set a cookie to track that we tried SSO (to prevent loops)
        const response = NextResponse.redirect(signInUrl);
        response.cookies.set("tried_sso", "true", {
            maxAge: 60, // 1 minute expiry
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });
        return response;
    }

    // User is authenticated - clear any SSO tracking cookie
    const response = NextResponse.next();
    if (request.cookies.get("tried_sso")) {
        response.cookies.delete("tried_sso");
    }

    // 5. Check Authorization (Roles)
    const clientRoles = (token as any).roles || [];

    // If no roles, redirect to unauthorized
    if (clientRoles.length === 0) {
        // Avoid infinite redirect if already on unauthorized (handled by check #3)
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api/auth|_next/static|_next/image|favicon.ico|logo-tesla-svg.svg).*)",
    ],
};
