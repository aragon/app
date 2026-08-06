// Hard limits shared by the assistant service (enforcement) and the chat widget (fast client-side
// rejection). The server is the source of truth; the widget only mirrors these for UX.
export const assistantLimits = {
    // Roomy on purpose: turns lost to upstream hiccups are refunded server-side, but a real
    // back-and-forth (plus a few retries) must never feel clipped. Cost abuse is bounded by the
    // AI Gateway spend budget + per-IP rpm/sessions-per-day, not by squeezing this.
    maxTurnsPerSession: 20,
    // The agent emits the ticket fields (title, description, steps) as tool-call arguments, and
    // reasoning models burn invisible thinking tokens — BOTH count against this cap (observed:
    // gemini-2.5-flash-lite spent 1168 thinking tokens on a draft and got clipped at 1200,
    // returning an empty turn). Roomy enough that thinking + a full draft is never clipped.
    maxOutputTokens: 4000,
    // The agent resends the transcript on every turn, so late turns cost the most. Generous
    // enough that a conversation hitting the turn limit is never cut off by tokens first: the
    // turn count is the graceful limiter.
    maxTokensPerSession: 60_000,
    // The chat lives on after a ticket: the agent can file up to this many in one session.
    maxIssuesPerSession: 3,
    maxFileSizeBytes: 5 * 1024 * 1024,
    // Attachments travel with messages, so the composer is what honest use runs into: a handful
    // of files per message. The widget enforces it client-side.
    maxFilesPerMessage: 3,
    // Server-side abuse guard on the per-session file queue (blob storage + the transfer of every
    // queued file into the ticket on creation). The queue drains on every created ticket, so
    // honest use never reaches this.
    maxFilesPerSession: 15,
    maxMessageLength: 4000,
    // 20 user turns + 20 assistant replies + slack for system/data-only entries.
    maxMessages: 44,
} as const;

export type IAssistantLimits = typeof assistantLimits;
