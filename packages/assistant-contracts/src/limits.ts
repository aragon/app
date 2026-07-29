// Hard limits shared by the assistant service (enforcement) and the chat widget (fast client-side
// rejection). The server is the source of truth; the widget only mirrors these for UX.
export const assistantLimits = {
    // Roomy on purpose: turns lost to upstream hiccups are refunded server-side, but a real
    // back-and-forth (plus a few retries) must never feel clipped. Cost abuse is bounded by the
    // AI Gateway spend budget + per-IP rpm/sessions-per-day, not by squeezing this.
    maxTurnsPerSession: 20,
    maxOutputTokens: 500,
    // Counts the FULL pipeline (classify + extract + respond each resend the transcript, so a
    // turn costs roughly 3× the respond call alone). Generous enough that a conversation hitting
    // the turn limit is never cut off by tokens first: the turn count is the graceful limiter.
    maxTokensPerSession: 60_000,
    maxIssuesPerSession: 1,
    maxFileSizeBytes: 5 * 1024 * 1024,
    maxFilesPerSession: 3,
    maxMessageLength: 4000,
    // 20 user turns + 20 assistant replies + slack for system/data-only entries.
    maxMessages: 44,
} as const;

export type IAssistantLimits = typeof assistantLimits;
