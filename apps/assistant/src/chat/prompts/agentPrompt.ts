import { buildFilingTicketSection } from './sections/filingTicket';
import { productAnswersSection } from './sections/productAnswers';
import { buildRoleSection } from './sections/role';
import { toneSection } from './sections/tone';

// The agent's system prompt, one file per section, in the order the model reads it: who it is,
// how it answers from the documentation (docsSearchEnabled only), what becomes a ticket, and tone.
// The app context (route, DAO, network) is client-supplied and stays out of the prompt: it reaches
// the team through the ticket, rendered as data.
export const buildAgentSystemPrompt = (params: {
    hasAttachments?: boolean;
    docsSearchEnabled?: boolean;
}) => {
    const { hasAttachments = false, docsSearchEnabled = false } = params;

    return [
        buildRoleSection(docsSearchEnabled),
        docsSearchEnabled ? productAnswersSection : undefined,
        buildFilingTicketSection(hasAttachments),
        toneSection,
    ]
        .filter((section) => section != null)
        .join('\n\n');
};
