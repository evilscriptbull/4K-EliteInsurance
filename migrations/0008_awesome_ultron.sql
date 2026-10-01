CREATE TABLE "agent_briefs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"lead_id" uuid NOT NULL,
	"conversation_id" uuid,
	"created_at" timestamp with time zone NOT NULL,
	"origin" text NOT NULL,
	"model" text,
	"prompt_version" text NOT NULL,
	"data" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_briefs" ADD CONSTRAINT "agent_briefs_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_briefs_lead_id_idx" ON "agent_briefs" USING btree ("lead_id");
--> statement-breakpoint
-- RLS enabled with NO policies -- default-deny for every role, including
-- `authenticated`. Unlike lead_outcomes, nothing here ever needs a
-- client-side Realtime subscription (the dashboard reads briefs via a
-- normal server-rendered fetch), so this matches conversation_messages'
-- stricter precedent instead.
ALTER TABLE "agent_briefs" ENABLE ROW LEVEL SECURITY;