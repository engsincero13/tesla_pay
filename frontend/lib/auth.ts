import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

import { Buffer } from "buffer";

function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("JWT Parse Error", e);
        return null;
    }
}

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: any) {
    try {
        const url =
            process.env.KEYCLOAK_ISSUER + "/protocol/openid-connect/token";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.KEYCLOAK_CLIENT_ID!,
                client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
            roles: getRolesFromToken(refreshedTokens.access_token),
        };
    } catch (error) {
        // Log estruturado sem expor detalhes sensíveis em produção
        if (process.env.NODE_ENV === "development") {
            console.error("Erro ao renovar token:", error);
        } else {
            console.error("Falha na renovação do token de acesso");
        }

        // Retorna apenas o erro, forçando re-autenticação
        // Não retorna o token antigo para evitar uso de credenciais expiradas
        return {
            error: "RefreshAccessTokenError",
        };
    }
}



function getRolesFromToken(accessToken: string): string[] {
    const decoded = parseJwt(accessToken);
    if (!decoded) return [];

    const clientRoles = decoded.resource_access?.[process.env.KEYCLOAK_CLIENT_ID!]?.roles || [];

    return clientRoles;
}

export const authOptions: NextAuthOptions = {
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_CLIENT_ID!,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
            issuer: process.env.KEYCLOAK_ISSUER!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, account, user }) {
            // Initial sign in
            if (account && user) {
                return {
                    accessToken: account.access_token,
                    accessTokenExpires: Date.now() + (account.expires_in as number) * 1000,
                    refreshToken: account.refresh_token,
                    user,
                    roles: getRolesFromToken(account.access_token as string),
                };
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token.accessTokenExpires as number)) {
                // Backfill roles if missing (e.g. form previous session cookie)
                if ((!token.roles || (token.roles as string[]).length === 0) && token.accessToken) {
                    token.roles = getRolesFromToken(token.accessToken as string);
                }
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string;
            session.error = token.error as string | undefined;
            if (token.user) {
                // @ts-ignore
                session.user = {
                    ...token.user as any,
                    roles: token.roles as string[] || []
                };
            }
            return session;
        },
    },
    theme: {
        colorScheme: "dark",
    },
};
