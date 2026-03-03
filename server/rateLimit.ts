import type { Request, Response, NextFunction } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

// In-memory store (use Redis for production/clustered environments)
const store: RateLimitStore = {};

// Default: 100 requests per 15 minutes
const DEFAULT_LIMIT = 100;
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * Rate limiting middleware using sliding window algorithm
 * Note: For production, consider using Redis or similar for distributed rate limiting
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const limit = options.limit || DEFAULT_LIMIT;
  const windowMs = options.windowMs || DEFAULT_WINDOW_MS;
  const message =
    options.message ||
    "Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.";
  const keyGenerator = options.keyGenerator || ((req) => req.ip || "unknown");

  // Cleanup old entries periodically
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, windowMs);

  // Prevent cleanup interval from keeping process alive
  cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Initialize or reset if window has passed
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment count
    store[key].count++;

    // Set rate limit headers
    const remaining = Math.max(0, limit - store[key].count);
    const resetTime = Math.ceil(store[key].resetTime / 1000); // Unix timestamp

    res.setHeader("X-RateLimit-Limit", limit.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", resetTime.toString());

    // Check if limit exceeded
    if (store[key].count > limit) {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * Stricter rate limit for authentication endpoints
 */
export const authRateLimit = rateLimit({
  limit: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
});

/**
 * Rate limit for contact form submissions
 */
export const contactRateLimit = rateLimit({
  limit: 5,
  windowMs: 60 * 1000, // 1 minute
  message: "Demasiados mensajes. Por favor, espera un momento antes de enviar otro.",
});

/**
 * Rate limit for checkout/payment endpoints
 */
export const paymentRateLimit = rateLimit({
  limit: 20,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Demasiadas solicitudes de pago. Intenta de nuevo más tarde.",
});
