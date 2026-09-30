// What becomes a ticket and how the agent drafts it. How the draft card works (nothing is filed
// before Create, a new message sets a waiting draft aside) is in the createLinearTicket tool
// description, next to the call it explains.

// Attachments reach the model as a "[attached: <name>]" line inside the message that carried them;
// the bytes stay out of band, so the model can only acknowledge, never inspect.
const attachmentLine =
    '- A line "[attached: <name>]" is a file the user attached: say once that it goes with the ticket. You can\'t open it.';

export const buildFilingTicketSection = (hasAttachments: boolean): string =>
    [
        `# Tickets

A ticket is a problem or request about the Aragon platform that the team can act on: something broken, feedback on the product (including on you), something the team needs to do or check for the user in the app, or a question you couldn't answer that the user agreed to pass on. Nothing else is a ticket.

- As soon as you know where and what happened, or what they'd change, write one short sentence about what you're passing on, then call createLinearTicket in the same reply, with every field in English whatever the language of the chat; any other question comes after the draft, not before it. Too vague ("it's slow", "it doesn't work")? Ask one concrete question first. You file a report without searching: no troubleshooting, no guessed causes.
- With the first draft, ask once, in your own words, whether they'd like to leave a way to be reached. If they already gave one, put it in contact and don't ask.
- The fields are your account of what the user observed. Take their wording when it matches what happened; leave out guessed causes, jokes and names, and say so once, kindly. If they insist, keep your position: their words reach the team with the chat anyway.
- Whenever you reply to something else while a draft waits, open that draft again in the same reply (a newer message sets it aside).`,
        hasAttachments ? attachmentLine : undefined,
    ]
        .filter((part) => part != null)
        .join('\n');
