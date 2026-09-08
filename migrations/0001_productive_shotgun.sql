CREATE TABLE "associates" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"family_slug" text NOT NULL,
	"claimed_by" uuid,
	"claimed_at" timestamp with time zone,
	"lead_id" uuid,
	"data" jsonb NOT NULL
);
