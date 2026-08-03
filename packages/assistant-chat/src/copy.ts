import {
    assistantLimits,
    type ITicketIntent,
} from '@aragon/assistant-contracts';
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
        title: 'Aragon Support Assistant',
        close: 'Close',
        startNewChat: 'Start new chat',
    },
    welcome: {
        greeting:
            "Hi! Tell us what's going on and we'll get it to the right team.",
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
        chatErrorFallback:
            'Something went wrong. Please try sending your message again.',
        emailEscapeHatch: `…or email your request to ${supportEmail} →`,
    },
    composer: {
        placeholder: 'Message…',
        inputLabel: 'Message',
        send: 'Send message',
        stop: 'Stop generating',
        addAttachment: 'Add attachment',
        attachmentsShared: 'Attachments are shared with the support team.',
    },
    attachments: {
        remove: 'Remove file',
        previewTitle: 'Image attachment preview',
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
        draftHeading: 'Review your request',
        intentLabel: {
            feedback: 'Feedback',
            bug: 'Bug report',
            support: 'Support request',
        } satisfies Record<ITicketIntent, string>,
        descriptionLabel: 'Details',
        stepsLabel: 'Steps to reproduce',
        contactLabel: 'Contact',
        preparing: 'Putting your request together…',
        addMore: 'Anything to add? Any detail helps — just keep typing.',
        create: 'Create',
        dismiss: 'Dismiss',
        creating: 'Creating your request…',
        dismissed: 'Draft dismissed. Keep chatting to prepare a new one.',
        superseded: 'This draft was set aside after your newer messages.',
        draftInterrupted:
            'That draft did not come through. Keep chatting to prepare a new one.',
        successTitle: 'Request created',
        contactUpdates:
            'If you left a way to reach you, the team will follow up there.',
        viewTicket: 'View request',
        errorTitle: "We couldn't create your request",
        errorFallback: 'Nothing was lost. Check your connection and try again.',
        retry: 'Retry',
    },
    markdown: {
        copyCode: 'Copy code',
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
