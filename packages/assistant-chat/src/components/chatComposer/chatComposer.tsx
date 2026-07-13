import { AlertInline, Button, IconType } from '@aragon/gov-ui-kit';
import { useAssistantChatContext } from '../../controller';
import { ChatAttachmentList } from '../chatAttachmentList';
import { buildFileAlertMessage } from './fileAlertMessage';

export interface IChatComposerProps {
    /**
     * Opens the native file picker.
     */
    onAttach: () => void;
}

const maxVisibleRows = 4;

export const ChatComposer: React.FC<IChatComposerProps> = (props) => {
    const { onAttach } = props;

    const {
        sendMessage,
        stop,
        chatStatus,
        flowState,
        isUploading,
        addFiles,
        attachments,
        fileAlert,
        dismissFileAlert,
        composerInput: input,
        setComposerInput: setInput,
    } = useAssistantChatContext();

    const isStreaming =
        chatStatus === 'submitted' || chatStatus === 'streaming';
    const canSend =
        input.trim().length > 0 &&
        !(isStreaming || isUploading) &&
        flowState !== 'creatingIssue';

    const handleSend = () => {
        if (!canSend) {
            return;
        }

        sendMessage(input.trim());
        setInput('');
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handlePaste = (event: React.ClipboardEvent) => {
        const files = Array.from(event.clipboardData.files);

        if (files.length > 0) {
            event.preventDefault();
            addFiles(files);
        }
    };

    const rows = Math.min(
        maxVisibleRows,
        Math.max(1, input.split('\n').length),
    );

    return (
        <div className="flex flex-none flex-col gap-2 border-neutral-100 border-t px-5 pt-2.5 pb-3.5">
            {fileAlert != null && (
                <div className="flex items-center justify-between gap-2">
                    <AlertInline
                        message={buildFileAlertMessage(fileAlert)}
                        variant="critical"
                    />
                    <Button
                        aria-label="Dismiss"
                        iconLeft={IconType.CLOSE}
                        onClick={dismissFileAlert}
                        size="sm"
                        variant="ghost"
                    />
                </div>
            )}
            <ChatAttachmentList />
            {attachments.length > 0 && (
                <p className="text-neutral-300 text-xs leading-normal">
                    Attachments are shared with the support team.
                </p>
            )}
            <div className="flex items-end gap-2">
                <Button
                    aria-label="Attach file"
                    iconLeft={IconType.PLUS}
                    onClick={onAttach}
                    size="md"
                    variant="tertiary"
                />
                <textarea
                    aria-label="Message"
                    className="min-w-0 flex-1 resize-none rounded-xl border border-neutral-100 bg-neutral-0 px-3.5 py-2.5 text-neutral-800 text-sm leading-normal outline-none transition-colors placeholder:text-neutral-300 focus:border-primary-400"
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder="Message…"
                    rows={rows}
                    value={input}
                />
                {/* One persistent button that swaps action: unmounting Stop mid-stream would
                    drop keyboard focus to the body. */}
                <Button
                    disabled={!(isStreaming || canSend)}
                    onClick={isStreaming ? stop : handleSend}
                    size="md"
                    variant={isStreaming ? 'secondary' : 'primary'}
                >
                    {isStreaming ? 'Stop' : 'Send'}
                </Button>
            </div>
        </div>
    );
};
