-- Tightens the "who can read live conversations over Realtime" policy from
-- 0004 (authenticated_can_read_conversations, USING (true) -- any logged-in
-- Supabase user). That was accepted at the time because every other staff
-- checkpoint was also session-only; now that verifyStaffRequest and the
-- dashboard page require an active `associates` row (see docs/architecture.md
-- "Staff access model"), this policy would otherwise be the one place still
-- trusting a bare session. SECURITY DEFINER + a pinned search_path so the
-- function can read `associates` regardless of the calling role's own grants,
-- without being vulnerable to a search_path hijack (a known privilege-
-- escalation vector for SECURITY DEFINER functions).
CREATE FUNCTION public.is_active_associate()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.associates WHERE id = auth.uid() AND active = true
  );
$$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.is_active_associate() TO authenticated;
--> statement-breakpoint
DROP POLICY "authenticated_can_read_conversations" ON "conversations";
--> statement-breakpoint
CREATE POLICY "active_associate_can_read_conversations" ON "conversations"
  FOR SELECT
  TO authenticated
  USING (public.is_active_associate());
