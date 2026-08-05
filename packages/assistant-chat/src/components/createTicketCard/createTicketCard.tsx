import type {
    ICreateTicketToolInput,
    ICreateTicketToolOutput,
} from '@aragon/assistant-contracts';
import {
    Button,
    Heading,
    Icon,
    IconType,
    Spinner,
    Tag,
} from '@aragon/gov-ui-kit';
import {
    type ToolCallMessagePartComponent,
    useAui,
    useAuiState,
} from '@assistant-ui/react';
import { useEffect } from 'react';
import { chatCopy } from '../../copy';
import { appendRequestToHistory } from '../../requests';

// The top margin separates the card from the assistant text preceding it in the same message.
const cardClassName =
    'mt-3 flex w-full flex-col gap-3.5 rounded-xl border border-neutral-100 bg-neutral-0 p-5 shadow-neutral-md first:mt-0';

// A draft nobody acted on is not an event worth a card: it collapses into a quiet line so the
// transcript stays readable while still reading honestly.
const spentNoteClassName =
    'mt-3 text-center text-neutral-400 text-xs leading-normal first:mt-0';

// The ticket draft the model assembled, rendered as an approval card in the transcript. It walks
// four states: the draft streaming in, the draft awaiting the user's Create/Dismiss decision, the
// creation in flight, and the terminal success/error. Ticket creation only runs once the user
// approves; the server dedupes and enforces the per-session cap, so this card owns UX only.
export const CreateTicketCard: ToolCallMessagePartComponent<
    ICreateTicketToolInput,
    ICreateTicketToolOutput
> = (props) => {
    const { args, result, isError, approval, respondToApproval } = props;

    const aui = useAui();

    // When the user keeps chatting past an undecided draft, the server resolves it as superseded
    // and a fresh draft follows — so an undecided card that is no longer last is spent, and its
    // Create button must not linger (approving it would file the outdated draft).
    const isLastMessage = useAuiState((state) => state.message.isLast);

    // The created ticket is remembered in the device-local history right where its card renders;
    // the append is idempotent by ticket identifier, so re-renders and remounts never duplicate.
    useEffect(() => {
        if (result != null && !isError) {
            appendRequestToHistory({
                identifier: result.identifier,
                url: result.url,
                summary: args.title ?? '',
                createdAt: new Date().toISOString(),
            });
        }
    }, [result, isError, args.title]);

    // Terminal success: the created ticket, linked out. The request history keeps its own copy.
    if (result != null && !isError) {
        return (
            <div className={cardClassName}>
                <div className="flex items-center gap-2">
                    <Icon
                        className="text-success-600"
                        icon={IconType.SUCCESS}
                        size="md"
                    />
                    <Heading as="h3" size="h5">
                        {chatCopy.ticketCard.successTitle}
                    </Heading>
                </div>
                <a
                    className="flex items-center gap-2"
                    href={result.url}
                    rel="noreferrer"
                    target="_blank"
                >
                    <Tag label={result.identifier} variant="primary" />
                    <span className="flex items-center gap-1 text-primary-400 text-sm underline">
                        {chatCopy.ticketCard.viewTicket}
                        <Icon icon={IconType.LINK_EXTERNAL} size="sm" />
                    </span>
                </a>
                <p className="text-neutral-500 text-sm leading-normal">
                    {chatCopy.ticketCard.contactUpdates}
                </p>
            </div>
        );
    }

    // A draft that broke before the user ever approved it (clipped stream, invalid tool input)
    // is not a failed creation — nothing was attempted, so the conversation just moves on.
    if (isError && approval?.approved !== true) {
        return (
            <p className={spentNoteClassName}>
                {chatCopy.ticketCard.draftInterrupted}
            </p>
        );
    }

    // Terminal failure: creation was attempted and threw. The server released its claim, so the
    // same conversation can retry — regenerating the turn re-drafts and re-attempts.
    if (isError) {
        const retry = () => aui.message().reload();
        return (
            <div className={cardClassName}>
                <div className="flex items-center gap-2">
                    <Icon
                        className="text-critical-600"
                        icon={IconType.WARNING}
                        size="md"
                    />
                    <Heading as="h3" size="h5">
                        {chatCopy.ticketCard.errorTitle}
                    </Heading>
                </div>
                <p className="text-neutral-500 text-sm leading-normal">
                    {chatCopy.ticketCard.errorFallback}
                </p>
                <Button
                    iconLeft={IconType.RELOAD}
                    onClick={retry}
                    size="sm"
                    variant="secondary"
                >
                    {chatCopy.ticketCard.retry}
                </Button>
            </div>
        );
    }

    // Superseded draft: the user kept typing past an undecided card, so the approval was never
    // answered — the server resolves it as superseded and a fresh draft follows.
    if (approval?.approved == null && !isLastMessage) {
        return (
            <p className={spentNoteClassName}>
                {chatCopy.ticketCard.superseded}
            </p>
        );
    }

    // Dismissed or cancelled draft: the user explicitly declined it.
    if (approval?.approved === false || approval?.resolution != null) {
        return (
            <p className={spentNoteClassName}>
                {chatCopy.ticketCard.dismissed}
            </p>
        );
    }

    // Approved and executing: the resume request is in flight, creating the ticket.
    if (approval?.approved === true) {
        return (
            <div className={cardClassName}>
                <div
                    className="flex items-center gap-2 text-neutral-500 text-sm"
                    role="status"
                >
                    <Spinner size="sm" variant="neutral" />
                    <span>{chatCopy.ticketCard.creating}</span>
                </div>
            </div>
        );
    }

    // Draft: either still streaming in, or complete and awaiting the user's decision. The approval
    // gate is attached the moment the arguments finish, which is exactly when the decision is ready.
    const awaitingDecision = approval != null && approval.approved == null;
    // Models number the steps despite the schema asking for unnumbered items; the list owns the
    // numbering, so any leading "1." / "1)" is stripped to avoid "1. 1. Open…".
    const steps = (args.stepsToReproduce ?? []).map((step) =>
        step.replace(/^\s*\d+\s*[.)]\s*/, ''),
    );

    return (
        <div className={cardClassName}>
            {/* The ticket leads with itself: its title is the card's heading. */}
            {args.title != null && (
                <Heading as="h3" size="h4">
                    {args.title}
                </Heading>
            )}
            {args.description != null && (
                <p className="whitespace-pre-wrap text-neutral-600 text-sm leading-normal">
                    {args.description}
                </p>
            )}
            {steps.length > 0 && (
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-neutral-800 text-sm leading-normal">
                        {chatCopy.ticketCard.stepsLabel}
                    </p>
                    <ol className="list-decimal pl-5 text-neutral-600 text-sm leading-normal">
                        {steps.map((step, index) => (
                            // Steps are positional and may repeat verbatim, so the index is the
                            // only stable identity available.
                            <li key={`step-${index}`}>{step}</li>
                        ))}
                    </ol>
                </div>
            )}
            {awaitingDecision ? (
                <>
                    {/* Deterministic invite to enrich the request: the model does not reliably
                        narrate around its tool call, so the card itself carries the nudge. */}
                    <p className="text-neutral-400 text-xs leading-normal">
                        {chatCopy.ticketCard.addMore}
                    </p>
                    {args.contact != null && args.contact.length > 0 && (
                        <p className="text-neutral-400 text-xs leading-normal">
                            {`${chatCopy.ticketCard.contactPrefix} ${args.contact}`}
                        </p>
                    )}
                    <div className="flex items-center gap-3 border-neutral-100 border-t pt-3.5">
                        <Button
                            onClick={() =>
                                respondToApproval({ approved: true })
                            }
                            size="md"
                            variant="primary"
                        >
                            {chatCopy.ticketCard.create}
                        </Button>
                        <Button
                            onClick={() =>
                                // The reason travels to the model as the denial output, so it
                                // reads the dismissal as the user's choice, not as a failure.
                                respondToApproval({
                                    approved: false,
                                    reason: 'The user dismissed the draft.',
                                })
                            }
                            size="md"
                            variant="tertiary"
                        >
                            {chatCopy.ticketCard.dismiss}
                        </Button>
                    </div>
                </>
            ) : (
                <div
                    className="flex items-center gap-2 text-neutral-400 text-xs"
                    role="status"
                >
                    <Spinner size="sm" variant="neutral" />
                    <span>{chatCopy.ticketCard.preparing}</span>
                </div>
            )}
        </div>
    );
};
