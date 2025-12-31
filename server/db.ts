import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

let database: NeonDatabase<typeof schema> | undefined;

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL no esta definido. Las operaciones que dependen de la base de datos se deshabilitaran.",
  );
} else {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  database = drizzle({ client: pool, schema });
}

export const db = database;
export const isDatabaseConfigured = Boolean(database);
