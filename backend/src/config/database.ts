import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "../models/schema";

const client = postgres(env.databaseUrl, {
  prepare: false,
});

export const db = drizzle(client, { schema });
