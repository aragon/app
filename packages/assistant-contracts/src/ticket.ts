import { z } from 'zod';

// Name of the agent tool that drafts and — on explicit user approval — creates a Linear support
// ticket. Single source of truth shared by the server tool registration and the widget's tool-call
// card, so the two can never disagree on the tool identity.
export const createTicketToolName = 'createLinearTicket';

// A ticket only ever files an actionable request; the off-topic/unknown intents the classifier used
// to emit are handled by the system-prompt refusal policy instead and never reach the tool.
export const ticketIntentSchema = z.enum(['feedback', 'bug', 'support']);

export type ITicketIntent = z.infer<typeof ticketIntentSchema>;

// Fields the model must assemble before calling the tool. A thin zod gate against thin or premature
// calls: an invalid call surfaces to the model as a tool error it recovers from by gathering more.
// Fields are English (enforced by the system prompt) while the chat stays in the user's language.
export const createTicketToolInputSchema = z.object({
    intent: ticketIntentSchema,
    title: z.string().min(8).max(160),
    description: z.string().min(20),
    // Optional: used for updates when provided, never blocks creation.
    email: z.string().optional(),
    // One step per item, unnumbered — the natural shape models produce; rendering owns numbering.
    stepsToReproduce: z.array(z.string()).optional(),
});

export type ICreateTicketToolInput = z.infer<
    typeof createTicketToolInputSchema
>;

// Result of a successful creation: rendered by the card as a link and appended to the client-side
// request history.
export const createTicketToolOutputSchema = z.object({
    identifier: z.string(),
    url: z.string(),
});

export type ICreateTicketToolOutput = z.infer<
    typeof createTicketToolOutputSchema
>;
