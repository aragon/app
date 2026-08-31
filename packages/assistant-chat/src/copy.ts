import { assistantLimits } from '@aragon/assistant-contracts';
import type { FileRejectReason } from './files/fileValidation';

// Single source of every user-facing string of the widget, grouped by component. Change wording
// here, not in the components.

// Escape hatch offered when the user prefers email or the chat hard-fails: filing a request by
// mail replaces the deprecated external support portal.
export const supportEmail = 'support@aragon.org';

export const supportEmailHref = `mailto:${supportEmail}`;

const maxFileSizeMb = Math.round(
    assistantLimits.maxFileSizeBytes / (1024 * 1024),
);

export const chatCopy = {
    header: {
        title: 'Aragon Assistant',
        collapse: 'Collapse chat',
        back: 'Back to chat',
        startNewChat: 'Start new chat',
        contextNew: 'New conversation',
        // Rendered ahead of the drafted ticket title, e.g. "Draft: Voting page crashes".
        contextDraftPrefix: 'Draft:',
    },
    welcome: {
        greeting: 'What do you need help with?',
        suggestions: [
            { label: 'Report a bug', message: "I'd like to report a bug." },
            {
                label: 'Share feedback',
                message: "I'd like to share some feedback.",
            },
            { label: 'I need help', message: 'I need help with something.' },
        ],
    },
    thread: {
        typing: 'Assistant is typing',
        copyMessage: 'Copy',
        // Prefix of the time divider of messages sent today, e.g. "Today 14:26".
        today: 'Today',
        chatErrorFallback:
            'Something went wrong. Please try sending your message again.',
        emailEscapeHatch: `…or email your request to ${supportEmail} →`,
    },
    composer: {
        placeholder: 'Describe the issue…',
        placeholderReply: 'Reply…',
        inputLabel: 'Message',
        send: 'Send message',
        stop: 'Stop generating',
        addAttachment: 'Add attachment',
        attachmentsShared: 'Attachments are shared with the support team.',
        escalationPrompt: 'Prefer a human?',
        escalationLink: 'Email support',
    },
    attachments: {
        remove: 'Remove file',
        previewTitle: 'Image attachment preview',
        closePreview: 'Close preview',
        typeLabel: {
            image: 'Image',
            document: 'Document',
            file: 'File',
        },
    },
    // Short and filename-free: the user can already see which file they just picked; the text
    // shows in the tooltip of the failed attachment tile.
    fileAlerts: {
        too_large: `File too large (max ${maxFileSizeMb} MB).`,
        unsupported: 'Unsupported file. Use an image, text, log or PDF.',
        file_limit: `You can attach up to ${assistantLimits.maxFilesPerMessage} files per message.`,
        uploadFailed: 'Upload failed. Please try again.',
        removeFailed: "Couldn't remove the file. Please try again.",
    } satisfies Record<
        FileRejectReason | 'uploadFailed' | 'removeFailed',
        string
    >,
    ticketCard: {
        stepsLabel: 'Steps to reproduce',
        // Rendered ahead of the contact the user left, e.g. "We'll reply to evan@aragon.org".
        contactPrefix: "We'll reply to",
        preparing: 'Putting your request together…',
        addMore: 'Anything to add? Keep typing — this draft updates.',
        create: 'Create ticket',
        dismiss: 'Dismiss',
        creating: 'Creating your request…',
        dismissed: 'Draft dismissed. Keep chatting to prepare a new one.',
        superseded:
            'Earlier draft set aside — your newer messages replaced it.',
        draftInterrupted:
            'That draft did not come through. Keep chatting to prepare a new one.',
        successTitle: 'Request created',
        contactUpdates:
            'If you left a way to reach you, the team will follow up there.',
        errorTitle: "We couldn't create your request",
        errorFallback: 'Nothing was lost. Check your connection and try again.',
        retry: 'Retry',
    },
    markdown: {
        copyCode: 'Copy code',
    },
    requestHistory: {
        heading: 'Past requests',
        empty: 'No requests from this device yet.',
    },
    serviceErrors: {
        rateLimited:
            "You're going a little too fast. Wait a moment and try again.",
        sessionLimit: `You've reached today's limit for new support chats. Email ${supportEmail} to open a new ticket.`,
        upstreamRateLimited:
            'The assistant is handling a lot of requests right now. Please try again in a minute.',
    },
} as const;
