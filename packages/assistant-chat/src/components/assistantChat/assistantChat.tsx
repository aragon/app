import { useDropzone } from 'react-dropzone';
import {
    AssistantChatProvider,
    useAssistantChatController,
} from '../../controller';
import { noopMonitoring } from '../../monitoring';
import { ChatComposer } from '../chatComposer';
import { ChatDrawer } from '../chatDrawer';
import { ChatDropOverlay } from '../chatDropOverlay';
import { ChatHeader } from '../chatHeader';
import { ChatMessageList } from '../chatMessageList';
import { ChatNewChatBar } from '../chatNewChatBar';
import { ChatStatusStrip } from '../chatStatusStrip';
import type { IAssistantChatProps } from './assistantChat.api';

export const AssistantChat: React.FC<IAssistantChatProps> = (props) => {
    const {
        isOpen,
        onClose,
        assistantUrl,
        appContext,
        supportPortalUrl,
        monitoring = noopMonitoring,
    } = props;

    const controller = useAssistantChatController({
        assistantUrl,
        appContext,
        supportPortalUrl,
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
            <ChatDrawer isOpen={isOpen} onClose={onClose}>
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
                        <ChatComposer onAttach={open} />
                    )}
                    <ChatDropOverlay isVisible={isDragActive} />
                </div>
            </ChatDrawer>
        </AssistantChatProvider>
    );
};
