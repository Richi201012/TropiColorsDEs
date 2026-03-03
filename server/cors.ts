import type { Request, Response, NextFunction } from "express";

/**
 * Secure CORS middleware with whitelist approach
 * Replaces insecure wildcard CORS settings
 */
export function createCorsMiddleware(allowedOrigins: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    // Check if origin is in whitelist (only if origin header is present)
    if (origin) {
      const isAllowed = allowedOrigins.some((allowed) => {
        // Support exact match and wildcard patterns
        if (allowed === "*") return true;
        if (allowed.endsWith("/*")) {
          const base = allowed.slice(0, -2);
          return origin.startsWith(base);
        }
        return origin === allowed;
      });

      if (isAllowed) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, Stripe-Signature"
        );
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours
      } else {
        // Origin not allowed - log for security monitoring
        console.warn(
          `CORS rejection: Origin "${origin}" not in whitelist from ${req.ip}`
        );
        // Still allow the request but without CORS headers
      }
    }

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      const preflightOrigin = req.headers.origin;
      const isPreflightAllowed = allowedOrigins.some((allowed) => {
        if (allowed === "*") return true;
        if (allowed.endsWith("/*")) {
          const base = allowed.slice(0, -2);
          return preflightOrigin?.startsWith(base);
        }
        return preflightOrigin === allowed;
      });

      if (isPreflightAllowed || allowedOrigins.includes("*")) {
        return res.status(204).end();
      }
      return res.status(403).end();
    }

    next();
  };
}

/**
 * Get allowed origins from environment variable
 * Supports comma-separated list of origins
 */
export function getAllowedOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (!envOrigins) {
    // Default to common development origins if not set
    // WARNING: In production, this should always be explicitly configured
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "WARNING: ALLOWED_ORIGINS not set in production! CORS may be too permissive."
      );
      return [];
    }
    // Development defaults
    return [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5000",
    ];
  }

  return envOrigins.split(",").map((origin) => origin.trim());
}
