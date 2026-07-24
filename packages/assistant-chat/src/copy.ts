// Single source of every user-facing string of the widget, grouped by component. Change wording
// here, not in the components; parameterized strings are functions so the wording and its
// placeholders stay next to each other.

// Escape hatch offered when the user prefers email or the chat hard-fails: filing a request by
// mail replaces the deprecated external support portal.
export const supportEmail = 'support@aragon.org';

export const supportEmailHref = `mailto:${supportEmail}`;

export const chatCopy = {
    header: {
        title: 'Aragon Support Assistant',
        close: 'Close',
    },
    messageList: {
        greeting:
            "Hi! Tell us what's going on and we'll get it to the right team.",
        chatErrorFallback:
            'Something went wrong. Please try sending your message again.',
        emailEscapeHatch: `…or email your request to ${supportEmail} →`,
        typing: 'Assistant is typing',
    },
    statusStrip: {
        hintChatting:
            "Done explaining? You'll review the ticket before it's sent.",
        hintPreviewing: 'Putting your ticket together…',
        hintPreviewUnclear:
            "We couldn't put a ticket together yet — tell us a bit more about what happened.",
        previewErrorFallback: 'The preview failed. Please try again.',
        prepareTicket: 'Prepare ticket',
        readyToSend: 'Ready to send',
        sendTicket: 'Send ticket',
        sending: 'Sending…',
        titleLabel: 'Title',
        attachmentsLabel: 'Attachments',
        attachmentsNone: 'None',
        attachmentsCount: (count: number) =>
            `${count} ${count === 1 ? 'file' : 'files'}`,
        attachedAutomatically:
            'The full conversation and debug info are attached automatically for the team.',
        notQuiteRight: 'Not quite right? Keep chatting and prepare it again.',
    },
    composer: {
        placeholder: 'Message…',
        messageLabel: 'Message',
        attachFile: 'Attach file',
        dismissAlert: 'Dismiss',
        send: 'Send',
        stop: 'Stop',
        attachmentsShared: 'Attachments are shared with the support team.',
    },
    fileAlerts: {
        tooLarge: (maxSizeMb: number) =>
            `File too large (max ${maxSizeMb} MB).`,
        unsupported: 'Unsupported file. Use an image, text, log or PDF.',
        removeFailed: "Couldn't remove the file. Please try again.",
        tooMany: (maxFiles: number) =>
            `You can attach up to ${maxFiles} files.`,
    },
    attachmentList: {
        uploadFailed: 'Upload failed',
        removingFile: 'Removing file',
        removeFile: 'Remove file',
    },
    dropOverlay: {
        dropFiles: 'Drop files to attach',
    },
    errorPanel: {
        title: "We couldn't create your request",
        issueErrorFallback:
            'Nothing was lost. Check your connection and try again.',
        retry: 'Retry',
        emailEscapeHatch: `…or email your request to ${supportEmail} →`,
    },
    successPanel: {
        title: 'Request created',
        emailUpdates: "If you left an email, we'll send updates there.",
    },
    newChatBar: {
        startNewChat: 'Start new chat',
        linkedToRequest:
            'This chat is linked to the created request. Need something else? Start a new chat.',
    },
    requestHistory: {
        heading: 'Past requests',
    },
    serviceErrors: {
        rateLimited:
            "You're going a little too fast. Wait a moment and try again.",
        sessionLimit: `You've reached today's limit for new support chats. Email ${supportEmail} to open a new ticket.`,
        upstreamRateLimited:
            'The assistant is handling a lot of requests right now. Please try again in a minute.',
    },
} as const;
