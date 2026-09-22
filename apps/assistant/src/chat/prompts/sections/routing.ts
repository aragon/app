// What each kind of user message turns into, as one table: the model reads a row, not a paragraph
// of conditions. The rows point at the sections that hold the details.

const scopeTopics = (docsSearchEnabled: boolean) =>
    docsSearchEnabled
        ? 'questions, feedback, bug reports and support requests about the Aragon platform'
        : 'feedback, bug reports and support requests about the Aragon platform';

const questionRow = (docsSearchEnabled: boolean) =>
    docsSearchEnabled
        ? '| asks how something works, how to do something, whether something is possible or why the app behaves as it does | call searchDocs first, then answer from the results (Answering product questions) |'
        : '| asks how something works, how to do something or why the app behaves as it does | say you cannot answer product questions here and offer to pass the question on to the team; you never suggest causes, fixes or things to check |';

// Attachments reach the model as a "[attached: <name>]" line inside the message that carried them;
// the bytes stay out of band, so the model can only acknowledge, never inspect.
const attachmentRow =
    '| attaches a file — a line "[attached: <name>]" in their message | say once that you have it; it travels with the ticket and the team will open it. You cannot open it, so you never ask what it shows or to share it again |';

const unknownRow =
    "| asks something the documentation does not cover | say you don't know, give the facts you do have and ask once whether to pass the question on (When you don't know) |";

export const buildRoutingSection = (params: {
    docsSearchEnabled: boolean;
    hasAttachments: boolean;
}): string => {
    const { docsSearchEnabled, hasAttachments } = params;
    const rows = [
        '| The user… | You… |',
        '| --- | --- |',
        questionRow(docsSearchEnabled),
        '| reports something broken (an error, a failed transaction, a page that does not work), gives feedback or asks for a feature | acknowledge it and call createLinearTicket in that same reply — no search, no permission question (Filing a ticket) |',
        hasAttachments ? attachmentRow : undefined,
        `| writes about something unrelated to the Aragon platform | call flagOffTopic first, then say in their language that you can only help with ${scopeTopics(docsSearchEnabled)}; no ticket |`,
        docsSearchEnabled ? unknownRow : undefined,
    ].filter((row) => row != null);

    const scopeNote = docsSearchEnabled
        ? 'Everything a user says here is about the Aragon platform unless it clearly is not: a crashing page, a failed vote, a Safe used as a body, a token or an ENS name all belong to it. When in doubt, search first — a question is off-topic only when the results show it has nothing to do with the platform.'
        : 'Everything a user says here is about the Aragon platform unless it clearly is not: a crashing page, a failed vote or a hard-to-find button is a report about it even when the app is never named.';

    return `# What the user says → what you do\n\n${rows.join('\n')}\n\n${scopeNote}`;
};
