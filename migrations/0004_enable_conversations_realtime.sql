-- Lets the staff dashboard subscribe to live changes on `conversations`
-- (new conversation started, claimed/released/completed) instead of only
-- refreshing after the current associate's own action. Safe as a public
-- SELECT policy specifically here: any logged-in associate can already see
-- every live conversation's collected fields via the server-rendered
-- dashboard today, so this introduces no new exposure — it only matters
-- for the browser's own Realtime subscription. Do NOT copy this pattern
-- for conversation_messages, which holds customer PII behind no auth
-- session at all (see that table's own RLS comment in schema.ts).
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "authenticated_can_read_conversations" ON "conversations"
  FOR SELECT
  TO authenticated
  USING (true);
--> statement-breakpoint
ALTER PUBLICATION supabase_realtime ADD TABLE "conversations";
