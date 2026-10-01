import { z } from 'zod';
import { assistantLimits } from './limits';

// Name of the agent tool that drafts and — on explicit user approval — creates a Linear support
// ticket. Single source of truth shared by the server tool registration and the widget's tool-call
// card, so the two can never disagree on the tool identity.
export const createTicketToolName = 'createLinearTicket';

// A ticket only ever files an actionable request; the off-topic/unknown intents the classifier used
// to emit are handled by the system-prompt refusal policy instead and never reach the tool. The
// description travels into the tool schema, which is where the model reads what each value means.
export const ticketIntentSchema = z
    .enum(['feedback', 'bug', 'support', 'question'])
    .describe(
        'feedback: a suggestion or opinion about the product, including about this assistant; bug: something is broken; support: the team needs to do or check something for the user in the app (their DAO, a proposal, their account); question: a product question you cannot answer, filed so the team can answer it. Describe the product question itself, without commentary about your knowledge or its sources.',
    );

export type ITicketIntent = z.infer<typeof ticketIntentSchema>;

// Fields the model must assemble before calling the tool. Lenient floors: a thin ticket is fine
// (the team follows up), while a strict floor turned short-but-valid drafts into tool errors the
// model then narrated verbatim to the user. The ceilings are far above anything a model drafts
// from a chat — they bound what a hand-made tool call can push into Linear. The description's is
// three messages long, since a draft may quote a pasted message in full next to its summary.
// The descriptions travel into the tool schema; that the fields are English while the chat stays
// in the user's language is a rule of the system prompt.
export const createTicketToolInputSchema = z.object({
    intent: ticketIntentSchema,
    title: z
        .string()
        .min(1)
        .max(160)
        .describe('What happened, so the team can find it.'),
    description: z
        .string()
        .min(1)
        .max(3 * assistantLimits.maxMessageLength)
        .describe('What the user observed, in your words.'),
    // Optional free-form contact channel (email, Telegram, anything the user offers): used by the
    // team to follow up when provided, never blocks creation.
    contact: z
        .string()
        .max(200)
        .optional()
        .describe('A way to reach the user, exactly as they gave it.'),
    // One step per item, unnumbered — the natural shape models produce; rendering owns numbering.
    stepsToReproduce: z
        .array(z.string().max(500))
        .max(30)
        .optional()
        .describe('For a bug: the steps that lead to it.'),
});

export type ICreateTicketToolInput = z.infer<
    typeof createTicketToolInputSchema
>;

// Result of a successful creation: the ticket reference the card renders and the client-side
// request history stores. Deliberately excludes the Linear URL — users have no access to the
// workspace, and anything in the output also reaches the model, which would narrate the link.
export const createTicketToolOutputSchema = z.object({
    identifier: z.string(),
});

export type ICreateTicketToolOutput = z.infer<
    typeof createTicketToolOutputSchema
>;
