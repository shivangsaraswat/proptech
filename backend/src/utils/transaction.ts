import { db } from "../config/database";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "../models/schema";

/**
 * Type for transaction context - can be either the main db or a transaction
 */
export type DbContext =
  | typeof db
  | PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

/**
 * Execute a function within a database transaction.
 * Automatically commits on success, rolls back on error.
 * 
 * @example
 * const result = await withTransaction(async (tx) => {
 *   const user = await tx.insert(users).values({...}).returning();
 *   const ticket = await tx.insert(tickets).values({...}).returning();
 *   return { user, ticket };
 * });
 */
export async function withTransaction<T>(
  callback: (tx: DbContext) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    return await callback(tx);
  });
}
