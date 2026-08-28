import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __pg?: ReturnType<typeof postgres> };

function client() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!globalForDb.__pg) {
    globalForDb.__pg = postgres(process.env.DATABASE_URL, {
      max: 10,
      prepare: false,
    });
  }
  return globalForDb.__pg;
}

export function db() {
  return drizzle(client(), { schema });
}

export { schema };
