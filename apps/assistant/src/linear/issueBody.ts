import type {
    IAppContext,
    IChatMessage,
    ICollectedFields,
    ISupportIntent,
} from '@aragon/assistant-contracts';
import { issueTexts } from '../chat/prompts/issueTexts';
import { fenceUserText, quoteUserText, toTranscript } from '../chat/transcript';

// A file that already moved into Linear storage (transfer happens during issue creation).
export interface IIssueAttachment {
    filename: string;
    assetUrl: string;
}

export const issueLabelByIntent: Partial<Record<ISupportIntent, string>> = {
    feedback: 'feedback',
    bug: 'bug',
    support: 'bug',
};

export const buildIssueTitle = (fields: ICollectedFields): string =>
    fields.summary?.trim() || issueTexts.fallbackTitle;

// A bullet list rather than a markdown table: Linear renders two-column tables cramped and
// narrow, while list rows use the full ticket width.
const renderContextRows = (
    appContext: IAppContext,
    sessionId: string,
): string => {
    const { contextLabels } = issueTexts;
    const rows: [string, string | undefined][] = [
        // The chat session identifier ties the ticket to the service logs (Vercel Logs and
        // Sentry Logs both index it) and to the Upstash session keys.
        [contextLabels.session, `\`${sessionId}\``],
        [contextLabels.route, appContext.route],
        [contextLabels.appVersion, appContext.appVersion],
        [contextLabels.dao, appContext.daoAddress],
        [contextLabels.network, appContext.network],
        [contextLabels.chainId, appContext.chainId?.toString()],
        [contextLabels.wallet, appContext.walletAddress],
        // The wallet address is the Sentry `user.id`, so support can jump straight to the session
        // replay and error events for this user.
        [
            contextLabels.sentry,
            appContext.walletAddress
                ? `search \`user.id:${appContext.walletAddress}\``
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
                transaction.type ?? issueTexts.defaultTransactionLabel;
            const hash = transaction.hash ? ` \`${transaction.hash}\`` : '';

            return `- ${label} — ${transaction.status}${hash}`;
        })
        .join('\n');

    return `## ${issueTexts.sections.recentTransactions}\n\n${items}`;
};

// User-authored content only ever appears inside quoted blocks so it cannot inject headings,
// mentions, checklists or collapsible markers into the ticket structure.
export const buildIssueDescription = (input: {
    sessionId: string;
    fields: ICollectedFields;
    appContext: IAppContext;
    messages: IChatMessage[];
    files: IIssueAttachment[];
}): string => {
    const { sessionId, fields, appContext, messages, files } = input;

    const sections: string[] = [];

    sections.push(
        `## ${issueTexts.sections.request}

- **${issueTexts.fieldLabels.intent}:** ${fields.intent}
- **${issueTexts.fieldLabels.email}:** ${fields.email ?? issueTexts.emptyValue}
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
        // Steps arrive as an unnumbered list (see collectedFieldsSchema); numbering is applied
        // here, at the single place that renders them.
        const steps = fields.stepsToReproduce
            .map((step, index) => `${String(index + 1)}. ${step}`)
            .join('\n');
        sections.push(
            `## ${issueTexts.sections.stepsToReproduce}\n\n${quoteUserText(steps)}`,
        );
    }

    if (files.length > 0) {
        const attachments = files
            .map((file) => `- [${file.filename}](${file.assetUrl})`)
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
