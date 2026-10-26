import type {
    IAppContext,
    IChatMessage,
    ICreateTicketToolInput,
    ITicketIntent,
} from '@aragon/assistant-contracts';
import { issueTexts } from '../chat/prompts/issueTexts';
import {
    codeUserText,
    fenceUserText,
    inlineUserText,
    quoteUserText,
    toTranscript,
} from '../chat/transcript';

// A file that already moved into Linear storage (transfer happens during issue creation).
export interface IIssueAttachment {
    filename: string;
    assetUrl: string;
}

// A question the documentation could not answer is filed as a documentation gap, so the docs
// team sees where the knowledge base falls short of what users ask.
export const issueLabelByIntent: Record<ITicketIntent, string> = {
    feedback: 'feedback',
    bug: 'bug',
    support: 'bug',
    question: 'docs-gap',
};

export const buildIssueTitle = (fields: ICreateTicketToolInput): string =>
    fields.title.trim() || issueTexts.fallbackTitle;

const inlineContextValue = (value: string | undefined) =>
    value == null ? value : inlineUserText(value);

// A bullet list rather than a markdown table: Linear renders two-column tables cramped and
// narrow, while list rows use the full ticket width. The app context is posted by the client, so
// its values are escaped like any other user text.
const renderContextRows = (
    appContext: IAppContext,
    sessionId: string,
): string => {
    const { contextLabels } = issueTexts;
    const rows: [string, string | undefined][] = [
        // The chat session identifier ties the ticket to the service logs (Vercel Logs and
        // Sentry Logs both index it) and to the Upstash session keys.
        [contextLabels.session, `\`${sessionId}\``],
        [contextLabels.route, inlineContextValue(appContext.route)],
        [contextLabels.appVersion, inlineContextValue(appContext.appVersion)],
        [contextLabels.dao, inlineContextValue(appContext.daoAddress)],
        [contextLabels.network, inlineContextValue(appContext.network)],
        [contextLabels.chainId, appContext.chainId?.toString()],
        [contextLabels.wallet, inlineContextValue(appContext.walletAddress)],
        // The wallet address is the Sentry `user.id`, so support can jump straight to the session
        // replay and error events for this user.
        [
            contextLabels.sentry,
            appContext.walletAddress
                ? `search ${codeUserText(`user.id:${appContext.walletAddress}`)}`
                : undefined,
        ],
    ];

    return rows
        .filter(([, value]) => value != null && value !== '')
        .map(([label, value]) => `- **${label}:** ${value}`)
        .join('\n');
};

// Recent on-chain actions captured silently for debugging — rendered only in the ticket.
const renderRecentTransactions = (appContext: IAppContext): string | null => {
    const transactions = appContext.recentTransactions ?? [];

    if (transactions.length === 0) {
        return null;
    }

    const items = transactions
        .map((transaction) => {
            const label =
                transaction.type == null
                    ? issueTexts.defaultTransactionLabel
                    : inlineUserText(transaction.type);
            const status = inlineUserText(transaction.status);
            const hash = transaction.hash
                ? ` ${codeUserText(transaction.hash)}`
                : '';

            return `- ${label} — ${status}${hash}`;
        })
        .join('\n');

    return `## ${issueTexts.sections.recentTransactions}\n\n${items}`;
};

// User-authored and client-posted content is escaped wherever it is rendered, and the extracted
// fields are quoted on top of that, so it cannot inject headings, mentions, links, checklists or
// collapsible markers into the ticket structure. The verbatim transcript is fenced instead.
export const buildIssueDescription = (input: {
    sessionId: string;
    fields: ICreateTicketToolInput;
    appContext: IAppContext;
    messages: IChatMessage[];
    files: IIssueAttachment[];
}): string => {
    const { sessionId, fields, appContext, messages, files } = input;

    const sections: string[] = [];

    sections.push(
        `## ${issueTexts.sections.request}

- **${issueTexts.fieldLabels.intent}:** ${fields.intent}
- **${issueTexts.fieldLabels.contact}:** ${fields.contact ? inlineUserText(fields.contact) : issueTexts.emptyValue}
${renderContextRows(appContext, sessionId)}`,
    );

    const recentTransactions = renderRecentTransactions(appContext);
    if (recentTransactions != null) {
        sections.push(recentTransactions);
    }

    sections.push(
        `## ${issueTexts.sections.description}\n\n${quoteUserText(fields.description ?? issueTexts.emptyValue)}`,
    );

    if (fields.stepsToReproduce != null && fields.stepsToReproduce.length > 0) {
        // The schema asks for unnumbered steps but models number them anyway; any leading
        // "1." / "1)" is stripped so the numbering applied here never doubles up.
        const steps = fields.stepsToReproduce
            .map(
                (step, index) =>
                    `${String(index + 1)}. ${step.replace(/^\s*\d+\s*[.)]\s*/, '')}`,
            )
            .join('\n');
        sections.push(
            `## ${issueTexts.sections.stepsToReproduce}\n\n${quoteUserText(steps)}`,
        );
    }

    if (files.length > 0) {
        const attachments = files
            .map(
                (file) =>
                    `- [${inlineUserText(file.filename)}](${file.assetUrl})`,
            )
            .join('\n');
        sections.push(
            `## ${issueTexts.sections.attachments}\n\n${attachments}`,
        );
    }

    const transcript = toTranscript(messages)
        .map(
            (entry) =>
                `**${entry.role === 'user' ? issueTexts.transcriptRoles.user : issueTexts.transcriptRoles.assistant}:**\n${fenceUserText(entry.text)}`,
        )
        .join('\n\n');
    // `+++ Title` is Linear's collapsible-section syntax; the transcript is collapsed by default.
    // The provenance note is for future automation reading tickets: the fenced content is
    // untrusted end-user input, not instructions.
    sections.push(
        `+++ ${issueTexts.sections.transcript}\n\n${issueTexts.transcriptProvenance}\n\n${transcript}\n\n+++`,
    );

    return sections.join('\n\n');
};
