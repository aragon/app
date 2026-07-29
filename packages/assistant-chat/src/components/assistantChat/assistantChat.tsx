import { useDropzone } from 'react-dropzone';
import {
    AssistantChatProvider,
    useAssistantChatController,
} from '../../controller';
import { noopMonitoring } from '../../monitoring';
import { ChatComposer } from '../chatComposer';
import { ChatDropOverlay } from '../chatDropOverlay';
import { ChatHeader } from '../chatHeader';
import { ChatMessageList } from '../chatMessageList';
import { ChatNewChatBar } from '../chatNewChatBar';
import { ChatStatusStrip } from '../chatStatusStrip';
import type { IAssistantChatProps } from './assistantChat.api';

// The widget fills whatever container the host renders it in — panel geometry, visibility and
// animations are owned by the host layout, so the same chat content works in a side panel, a
// fullscreen overlay or any future shell.
export const AssistantChat: React.FC<IAssistantChatProps> = (props) => {
    const {
        isOpen,
        onClose,
        assistantUrl,
        appContext,
        monitoring = noopMonitoring,
    } = props;

    const controller = useAssistantChatController({
        assistantUrl,
        appContext,
        monitoring,
    });

    const isLocked = controller.flowState === 'issueCreated';

    // One addFiles entry point for all three attach paths: the dropzone covers picker (open) and
    // drag-and-drop, the composer forwards clipboard pastes. Type and size filtering happens
    // inside addFiles so all paths share it.
    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
        noClick: true,
        noKeyboard: true,
        disabled: isLocked,
        onDrop: controller.addFiles,
    });

    return (
        <AssistantChatProvider value={controller}>
            <div
                {...getRootProps({
                    className: 'relative flex h-full min-h-0 flex-col',
                })}
            >
                <input {...getInputProps()} />
                <ChatHeader onClose={onClose} />
                <ChatMessageList />
                <ChatStatusStrip />
                {isLocked ? (
                    <ChatNewChatBar />
                ) : (
                    <ChatComposer isOpen={isOpen} onAttach={open} />
                )}
                <ChatDropOverlay isVisible={isDragActive} />
            </div>
        </AssistantChatProvider>
    );
};
