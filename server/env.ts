/**
 * Environment validation for required configuration
 */

export interface EnvConfig {
  // Database
  DATABASE_URL?: string;

  // Stripe (required for payments)
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;

  // Twilio (optional - for SMS notifications)
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;

  // Email (optional - for email notifications)
  EMAIL_SMTP_HOST?: string;
  EMAIL_SMTP_PORT?: string;
  EMAIL_SMTP_SECURE?: string;
  EMAIL_SMTP_USER?: string;
  EMAIL_SMTP_PASS?: string;
  EMAIL_FROM?: string;
  EMAIL_TO?: string;

  // Security
  ALLOWED_ORIGINS?: string;
  SESSION_SECRET?: string;

  // App config
  NODE_ENV?: string;
  PORT?: string;
  BASE_URL?: string;
}

// Type-safe way to access process.env
function getEnvVar(key: string): string | undefined {
  return (process as unknown as Record<string, string | undefined>)[key] ?? 
         (typeof process !== 'undefined' ? process.env?.[key] : undefined);
}

function getEnvVarRaw(key: string): string | undefined {
  if (typeof process === 'undefined') return undefined;
  return process.env?.[key];
}

const REQUIRED_IN_PRODUCTION: (keyof EnvConfig)[] = [];

const RECOMMENDED_IN_PRODUCTION: (keyof EnvConfig)[] = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "ALLOWED_ORIGINS",
];

/**
 * Validate environment configuration
 * Returns array of validation errors
 */
export function validateEnv(): string[] {
  const errors: string[] = [];
  const nodeEnv = getEnvVarRaw("NODE_ENV");

  // Check required variables in production
  if (nodeEnv === "production") {
    for (const key of REQUIRED_IN_PRODUCTION) {
      const value = getEnvVar(key);
      if (!value) {
        errors.push(`Required environment variable ${key} is not set`);
      }
    }

    // Warn about recommended variables
    for (const key of RECOMMENDED_IN_PRODUCTION) {
      const value = getEnvVar(key);
      if (!value) {
        // eslint-disable-next-line no-console
        console.warn(
          `Warning: Recommended environment variable ${key} is not set for production`
        );
      }
    }
  }

  // Validate Stripe configuration if any Stripe variables are set
  const stripeKey = getEnvVar("STRIPE_SECRET_KEY");
  if (stripeKey && !stripeKey.startsWith("sk_")) {
    errors.push("STRIPE_SECRET_KEY must start with 'sk_'");
  }

  const stripeWebhook = getEnvVar("STRIPE_WEBHOOK_SECRET");
  if (stripeWebhook && !stripeWebhook.startsWith("whsec_")) {
    errors.push("STRIPE_WEBHOOK_SECRET must start with 'whsec_'");
  }

  // Validate email configuration if SMTP host is provided
  const smtpHost = getEnvVar("EMAIL_SMTP_HOST");
  const smtpUser = getEnvVar("EMAIL_SMTP_USER");
  if (smtpHost && !smtpUser) {
    // eslint-disable-next-line no-console
    console.warn(
      "Warning: EMAIL_SMTP_HOST is set but EMAIL_SMTP_USER is not configured"
    );
  }

  return errors;
}

/**
 * Initialize environment validation
 * Throws error in production if validation fails
 */
export function initEnv(): void {
  const errors = validateEnv();

  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.join("\n")}`;
    const nodeEnv = getEnvVarRaw("NODE_ENV");

    if (nodeEnv === "production") {
      throw new Error(errorMessage);
    } else {
      // eslint-disable-next-line no-console
      console.warn(errorMessage);
    }
  }

  // Log security warnings in production
  const nodeEnv = getEnvVarRaw("NODE_ENV");
  if (nodeEnv === "production") {
    const allowedOrigins = getEnvVar("ALLOWED_ORIGINS");
    if (allowedOrigins === "*") {
      // eslint-disable-next-line no-console
      console.error(
        "SECURITY WARNING: ALLOWED_ORIGINS is set to '*' in production!"
      );
    }

    const sessionSecret = getEnvVar("SESSION_SECRET");
    if (!sessionSecret) {
      // eslint-disable-next-line no-console
      console.error(
        "SECURITY WARNING: SESSION_SECRET is not set in production!"
      );
    }
  }
}

/**
 * Get validated environment variable
 * Throws error if not set and required
 */
export function getEnv(key: keyof EnvConfig, required = false): string | undefined {
  const value = getEnvVar(key);

  if (required && !value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  return value;
}
