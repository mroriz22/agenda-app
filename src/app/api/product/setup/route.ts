import postgres from "postgres";

export const runtime = "nodejs";

/**
 * Cria o database do SaaS (se faltar) e aplica o schema.
 * O Postgres da fábrica só é alcançável de dentro da rede do servidor, então
 * a migração roda por aqui, uma vez, protegida por SETUP_TOKEN.
 * É idempotente: rodar de novo não quebra nada.
 */

const DDL = [
  `CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "email_verified" boolean DEFAULT false NOT NULL,
    "image" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "user_email_unique" UNIQUE("email")
  )`,
  `CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY NOT NULL,
    "expires_at" timestamp NOT NULL,
    "token" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "user_id" text NOT NULL,
    CONSTRAINT "session_token_unique" UNIQUE("token")
  )`,
  `CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY NOT NULL,
    "account_id" text NOT NULL,
    "provider_id" text NOT NULL,
    "user_id" text NOT NULL,
    "access_token" text,
    "refresh_token" text,
    "id_token" text,
    "access_token_expires_at" timestamp,
    "refresh_token_expires_at" timestamp,
    "scope" text,
    "password" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS "entitlement" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "status" text DEFAULT 'none' NOT NULL,
    "plan" text DEFAULT 'free' NOT NULL,
    "trial_started_at" timestamp,
    "trial_ends_at" timestamp,
    "current_period_end" timestamp,
    "quack_product_id" text,
    "quack_order_id" text,
    "last_quack_event_id" text,
    "total_cents" integer,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "billing_event" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text,
    "type" text NOT NULL,
    "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "snapshot" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "data" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "device" text,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  )`,
  `ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade`,
  `ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade`,
  `ALTER TABLE "entitlement" ADD CONSTRAINT "entitlement_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade`,
  `ALTER TABLE "billing_event" ADD CONSTRAINT "billing_event_user_id_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "entitlement_user_uidx" ON "entitlement" ("user_id")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "snapshot_user_uidx" ON "snapshot" ("user_id")`,
];

/** erros de "já existe" que a idempotência pode ignorar */
const IGNORE = new Set(["42P07", "42710", "42P16"]);

export async function POST(req: Request) {
  const token = process.env.SETUP_TOKEN;
  if (!token) return Response.json({ error: "setup desabilitado" }, { status: 404 });
  if (req.headers.get("x-setup-token") !== token) {
    return Response.json({ error: "token inválido" }, { status: 401 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) return Response.json({ error: "DATABASE_URL ausente" }, { status: 500 });

  const dbName = new URL(url).pathname.replace(/^\//, "");
  const steps: string[] = [];

  // 1. database
  const adminUrl = url.replace(/\/[^/]*$/, "/postgres");
  const admin = postgres(adminUrl, { max: 1, prepare: false });
  try {
    const rows = await admin`SELECT 1 FROM pg_database WHERE datname = ${dbName}`;
    if (rows.length === 0) {
      await admin.unsafe(`CREATE DATABASE "${dbName}"`);
      steps.push(`database ${dbName} criado`);
    } else {
      steps.push(`database ${dbName} já existia`);
    }
  } catch (e) {
    return Response.json({ error: `database: ${String(e)}`, steps }, { status: 500 });
  } finally {
    await admin.end({ timeout: 5 });
  }

  // 2. schema
  const sql = postgres(url, { max: 1, prepare: false });
  let created = 0;
  try {
    for (const stmt of DDL) {
      try {
        await sql.unsafe(stmt);
        created++;
      } catch (e) {
        const code = (e as { code?: string }).code ?? "";
        if (!IGNORE.has(code)) throw e;
      }
    }
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name`;
    steps.push(`${created} comandos aplicados`);
    return Response.json({
      ok: true,
      steps,
      tables: tables.map((t) => t.table_name as string),
    });
  } catch (e) {
    return Response.json({ error: `schema: ${String(e)}`, steps }, { status: 500 });
  } finally {
    await sql.end({ timeout: 5 });
  }
}
