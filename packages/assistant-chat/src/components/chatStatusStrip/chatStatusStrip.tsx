import { Button, Icon, IconType } from '@aragon/gov-ui-kit';
import { type ChatFlowState, useAssistantChatContext } from '../../controller';
import { getAssistantErrorText } from '../../transport';

// One hint line above the composer while no preview is up for review; the button next to it is
// the single ticket affordance.
const hintByFlowState: Partial<Record<ChatFlowState, string>> = {
    chatting: "Done explaining? You'll review the ticket before it's sent.",
    previewing: 'Putting your ticket together…',
    previewUnclear:
        "We couldn't put a ticket together yet — tell us a bit more about what happened.",
};

// The single ticket affordance: a compact sticky bar between messages and composer. It never
// lives in the scroll area, so it can't push the conversation off-screen; the reviewed preview
// expands in place (shrinking the scroll viewport, not scrolling content away).
export const ChatStatusStrip: React.FC = () => {
    const {
        flowState,
        ticketPreview,
        previewError,
        attachments,
        prepareTicket,
        createIssue,
        isUploading,
        isRemoving,
    } = useAssistantChatContext();

    if (
        flowState === 'idle' ||
        flowState === 'issueCreated' ||
        // The error panel owns the failed-creation moment (message, retry, portal link).
        flowState === 'issueError'
    ) {
        return null;
    }

    const isCreating = flowState === 'creatingIssue';

    // Collecting bar: hint + Prepare button. A failed preview shows its human message in place
    // of the hint; pressing the button again retries.
    if (flowState !== 'previewReady' && !isCreating) {
        const hint =
            previewError != null
                ? getAssistantErrorText(
                      previewError.code,
                      'The preview failed. Please try again.',
                  )
                : hintByFlowState[flowState];

        return (
            <div
                className="flex flex-none items-center gap-2 border-neutral-100 border-t bg-neutral-50 py-2 pr-3 pl-5"
                role="status"
            >
                <Icon
                    className="flex-none text-neutral-300"
                    icon={IconType.INFO}
                    size="sm"
                />
                <p className="flex-1 text-neutral-500 text-xs leading-normal">
                    {hint}
                </p>
                <Button
                    disabled={flowState === 'previewing'}
                    isLoading={flowState === 'previewing'}
                    onClick={prepareTicket}
                    size="sm"
                    variant="secondary"
                >
                    Prepare ticket
                </Button>
            </div>
        );
    }

    const activeAttachments = attachments.filter(
        (attachment) => attachment.status !== 'error',
    );
    const attachmentLabel =
        activeAttachments.length > 0
            ? `${activeAttachments.length} ${activeAttachments.length === 1 ? 'file' : 'files'}`
            : 'None';

    // Reviewed preview: the title the ticket gets, plus what travels with it. The description
    // can be long and is deliberately not shown — the full conversation is attached anyway.
    return (
        <div className="flex flex-none flex-col border-neutral-100 border-t bg-success-100">
            <div
                className="flex items-center gap-2 py-2 pr-3 pl-5"
                role="status"
            >
                <Icon
                    className="flex-none text-success-800"
                    icon={IconType.CHECKMARK}
                    size="sm"
                />
                <p className="flex-1 font-semibold text-success-800 text-xs">
                    Ready to send
                </p>
                <Button
                    disabled={isUploading || isRemoving || isCreating}
                    isLoading={isCreating}
                    onClick={createIssue}
                    size="sm"
                    variant="primary"
                >
                    {isCreating ? 'Sending…' : 'Send ticket'}
                </Button>
            </div>
            <div className="flex flex-col gap-2 border-success-200 border-t bg-neutral-0 px-5 py-3">
                <div className="flex flex-col gap-px">
                    <p className="text-neutral-500 text-xs uppercase tracking-wide">
                        Title
                    </p>
                    <p className="whitespace-pre-wrap text-neutral-800 text-sm leading-normal">
                        {ticketPreview?.summary}
                    </p>
                </div>
                <div className="flex flex-col gap-px">
                    <p className="text-neutral-500 text-xs uppercase tracking-wide">
                        Attachments
                    </p>
                    <p className="text-neutral-800 text-sm leading-normal">
                        {attachmentLabel}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 pt-1 text-neutral-400 text-xs">
                    <Icon icon={IconType.INFO} size="sm" />
                    <span>
                        The full conversation and debug info are attached
                        automatically for the team.
                    </span>
                </div>
                <p className="text-neutral-400 text-xs">
                    Not quite right? Keep chatting and prepare it again.
                </p>
            </div>
        </div>
    );
};
