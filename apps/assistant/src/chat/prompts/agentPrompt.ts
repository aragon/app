import { filingTicketSection } from './sections/filingTicket';
import { productAnswersSection } from './sections/productAnswers';
import { buildRememberSection } from './sections/remember';
import { buildRoleSection } from './sections/role';
import { buildRoutingSection } from './sections/routing';
import { toneSection } from './sections/tone';

// The agent's single system prompt, assembled from one file per section (sections/*.ts) so a
// change to one rule is a diff of one section. Order is priority: role, routing, product answers,
// the ticket flow, tone, and a short reminder of what matters most. The prompt holds the whole
// intake conversation, refuses off-topic requests itself (no classifier step) and files tickets
// through the createLinearTicket tool; with docsSearchEnabled it also answers product questions
// from the documentation tools. The app context (route, DAO, network) is client-supplied and
// stays out of the prompt: it reaches the team through the ticket, rendered as data.
export const buildAgentSystemPrompt = (params: {
    hasAttachments?: boolean;
    docsSearchEnabled?: boolean;
}) => {
    const { hasAttachments = false, docsSearchEnabled = false } = params;

    return [
        buildRoleSection(docsSearchEnabled),
        buildRoutingSection({ docsSearchEnabled, hasAttachments }),
        docsSearchEnabled ? productAnswersSection : undefined,
        filingTicketSection,
        toneSection,
        buildRememberSection(docsSearchEnabled),
    ]
        .filter((section) => section != null)
        .join('\n\n');
};
