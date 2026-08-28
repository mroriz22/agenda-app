import { jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Estado do produto por usuário: UM snapshot JSON da agenda.
 * Mesmo modelo que o app já usava (last-write-wins por store.updatedAt),
 * só que agora no Postgres da fábrica em vez do Supabase.
 */
export const snapshot = pgTable(
  "snapshot",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    device: text("device"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("snapshot_user_uidx").on(t.userId)],
);

export type Snapshot = typeof snapshot.$inferSelect;
