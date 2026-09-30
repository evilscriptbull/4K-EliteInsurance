CREATE TABLE "lead_outcomes" (
	"lead_id" uuid PRIMARY KEY NOT NULL,
	"assigned_to" uuid,
	"status" text DEFAULT 'new' NOT NULL,
	"written_premium" numeric,
	"carrier" text,
	"notes" text,
	"updated_by" uuid,
	"updated_at" timestamp with time zone NOT NULL,
	"contacted_at" timestamp with time zone,
	"quoted_at" timestamp with time zone,
	"bound_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "lead_outcomes" ADD CONSTRAINT "lead_outcomes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Deliberate deviation from a stricter "no policies" default (see the
-- doc comment on leadOutcomes in schema.ts): the follow-up queue's
-- Take/Log outcome/Release actions need to update a *second* associate's
-- dashboard live, and DashboardLiveRefresh's only mechanism is a
-- client-side Realtime postgres_changes subscription, which needs a
-- SELECT policy to receive anything. Reuses is_active_associate() from
-- migrations/0005_active_associate_realtime_policy.sql rather than
-- redefining it. Safe for the same reason migration 0004 accepted this for
-- `conversations`: every active associate can already see every open
-- lead's outcome via the server-rendered follow-up queue, so this
-- introduces no new exposure -- it only unblocks the browser's own
-- subscription.
ALTER TABLE "lead_outcomes" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "active_associate_can_read_lead_outcomes" ON "lead_outcomes"
  FOR SELECT
  TO authenticated
  USING (public.is_active_associate());
--> statement-breakpoint
ALTER PUBLICATION supabase_realtime ADD TABLE "lead_outcomes";