CREATE TABLE "snapshot" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"device" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "snapshot_user_uidx" ON "snapshot" USING btree ("user_id");