import { Button } from '@aragon/gov-ui-kit';
import { useAssistantChatContext } from '../../controller';
import { chatCopy } from '../../copy';

// One ticket = one chat: once the request is created the composer is replaced by this bar and
// a fresh request starts through an explicit new chat.
export const ChatNewChatBar: React.FC = () => {
    const { startNewChat } = useAssistantChatContext();

    return (
        <div className="flex flex-none flex-col gap-2 border-neutral-100 border-t px-5 pt-3.5 pb-4">
            <Button onClick={startNewChat} size="md" variant="primary">
                {chatCopy.newChatBar.startNewChat}
            </Button>
            <p className="text-center text-neutral-500 text-xs leading-normal">
                {chatCopy.newChatBar.linkedToRequest}
            </p>
        </div>
    );
};
