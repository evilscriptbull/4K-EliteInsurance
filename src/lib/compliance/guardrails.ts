/**
 * Hard rules for anything AI-generated (lead warmer replies, content engine
 * drafts, agent-copilot output) before it reaches a prospect or the public.
 * These come directly from the "Guardrails" section of the platform spec —
 * treat this file as the enforcement point, not just documentation.
 */

export const guardrails = {
  neverImplyCoverageBound: true,
  noDefinitiveLicensedCoverageDeterminations: true,
  noGuaranteedSavingsOrUnsupportedComparisons: true,
  neverFabricateCarrierProductsRatesAppetiteOrUnderwriting: true,
  requireApprovedStateAppropriateLanguage: true,
  requireHumanReviewForHigherRiskRecommendations: true,
  trackSmsEmailConsent: true,
  leastPrivilegeDataAccess: true,
} as const;

/**
 * Phrases/patterns that should never appear in AI-generated customer-facing
 * text. This is a starting seed list, not exhaustive — expand as the lead
 * warmer and content engine are built out, and review with whoever ends up
 * owning compliance sign-off (open question).
 */
export const bannedPhrasePatterns: RegExp[] = [
  /you('re| are) covered/i,
  /coverage is bound/i,
  /guaranteed savings?/i,
  /guaranteed (to save|lower|cheaper)/i,
  /we guarantee/i,
  /definitely covers?/i,
  /this policy will cover/i,
];

export function violatesGuardrails(text: string): boolean {
  return bannedPhrasePatterns.some((pattern) => pattern.test(text));
}
